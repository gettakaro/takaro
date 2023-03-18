import {
  Configuration,
  FrontendApi,
  IdentityApi,
  OAuth2Api,
} from '@ory/client';
import { Client as OpenIdClient, Issuer } from 'openid-client';
import { config } from './config.js';
import { errors, logger } from '@takaro/util';
import { AdminClient as TakaroClient } from '@takaro/apiclient';
import { createAxiosClient } from './lib/oryAxiosClient.js';
import { paginateIdentities } from './lib/paginationHelpers.js';
import { Request } from 'express';

enum IDENTITY_SCHEMA {
  USER = 'user_v0',
}

export interface ITakaroIdentity {
  id: string;
  email: string;
  domainId: string;
}

function metadataTypeguard(
  metadata: unknown
): metadata is { domainId: string } {
  return (
    typeof metadata === 'object' && metadata !== null && 'domainId' in metadata
  );
}

class Ory {
  private authToken: string | null = null;
  private issuer: Issuer;
  private log = logger('ory');

  private client: OpenIdClient;
  private adminClient: OAuth2Api;
  private identityClient: IdentityApi;
  private frontendClient: FrontendApi;
  private takaro: TakaroClient;

  constructor() {
    this.identityClient = new IdentityApi(
      new Configuration({
        basePath: config.get('kratos.adminUrl'),
      }),
      undefined,
      createAxiosClient(config.get('kratos.adminUrl'))
    );

    this.frontendClient = new FrontendApi(
      new Configuration({
        basePath: config.get('hydra.publicUrl'),
      }),
      undefined,
      createAxiosClient(config.get('hydra.publicUrl'))
    );
    this.adminClient = new OAuth2Api(
      new Configuration({
        basePath: config.get('hydra.adminUrl'),
      }),
      undefined,
      createAxiosClient(config.get('hydra.adminUrl'))
    );

    this.takaro = new TakaroClient({
      url: config.get('takaro.url'),
      auth: {},
    });
  }

  public async init() {
    this.issuer = await Issuer.discover(config.get('hydra.publicUrl'));
    this.log.debug(`Discovered issuer at ${config.get('hydra.publicUrl')}`);
    this.client = new this.issuer.Client({
      client_id: config.get('hydra.adminClientId'),
      client_secret: config.get('hydra.adminClientSecret'),
    });
  }

  public async getOidcToken(): Promise<string> {
    const grantRes = await this.client.grant({
      grant_type: 'client_credentials',
    });

    if (!grantRes.access_token) {
      this.log.error('Failed to get access token');
      throw new errors.InternalServerError();
    }
    console.log(grantRes);

    const introspectRes = await this.adminClient.introspectOAuth2Token({
      token: grantRes.access_token,
    });
    console.log(introspectRes.data);

    return grantRes.access_token;
  }

  public async getJobToken(domainId: string) {
    const oidcToken = await this.getOidcToken();

    const tokenRes = await this.takaro.domain.domainControllerGetToken(
      {
        domainId,
      },
      {
        headers: {
          Authorization: `Bearer ${oidcToken}`,
        },
      }
    );

    return tokenRes.data.data.token;
  }

  async deleteIdentitiesForDomain(domainId: string) {
    for await (const identities of paginateIdentities(this.identityClient)) {
      for (const identity of identities) {
        if (
          identity.metadata_public &&
          metadataTypeguard(identity.metadata_public) &&
          identity.metadata_public.domainId === domainId
        ) {
          await this.deleteIdentity(identity.id);
        }
      }
    }
  }

  async getIdentity(id: string): Promise<ITakaroIdentity> {
    const res = await this.identityClient.getIdentity({
      id,
    });

    if (!res.data.metadata_public) {
      this.log.warn('Identity has no metadata_public', {
        identity: res.data.id,
      });
      throw new errors.ForbiddenError();
    }

    if (!metadataTypeguard(res.data.metadata_public)) {
      this.log.warn(
        'Identity metadata_public is not of type {domainId: string}',
        { identity: res.data.id }
      );
      throw new errors.ForbiddenError();
    }

    return {
      id: res.data.id,
      email: res.data.traits.email,
      domainId: res.data.metadata_public.domainId,
    };
  }

  async createIdentity(
    email: string,
    password: string,
    domainId: string
  ): Promise<ITakaroIdentity> {
    const res = await this.identityClient.createIdentity({
      createIdentityBody: {
        schema_id: IDENTITY_SCHEMA.USER,
        traits: {
          email,
        },
        metadata_public: {
          domainId,
        },
        credentials: {
          password: {
            config: {
              password,
            },
          },
        },
      },
    });

    return {
      id: res.data.id,
      email: res.data.traits.email,
      domainId,
    };
  }

  async deleteIdentity(id: string): Promise<void> {
    await this.identityClient.deleteIdentity({
      id,
    });
  }

  async getIdentityFromReq(req: Request): Promise<ITakaroIdentity> {
    const tokenFromAuthHeader = req.headers['authorization']?.replace(
      'Bearer ',
      ''
    );

    const sessionRes = await this.frontendClient.toSession({
      cookie: req.headers.cookie,
      xSessionToken: tokenFromAuthHeader,
    });

    if (!sessionRes.data.identity.metadata_public) {
      this.log.warn('Identity has no metadata_public', {
        identity: sessionRes.data.identity.id,
      });
      throw new errors.ForbiddenError();
    }

    if (!metadataTypeguard(sessionRes.data.identity.metadata_public)) {
      this.log.warn(
        'Identity metadata_public is not of type {domainId: string}',
        { identity: sessionRes.data.identity.id }
      );
      throw new errors.ForbiddenError();
    }

    return {
      id: sessionRes.data.identity.id,
      email: sessionRes.data.identity.traits.email,
      domainId: sessionRes.data.identity.metadata_public.domainId,
    };
  }

  async submitApiLogin(username: string, password: string) {
    const flow = await this.frontendClient.createNativeLoginFlow({
      refresh: true,
    });
    return this.frontendClient.updateLoginFlow({
      flow: flow.data.id,
      updateLoginFlowBody: {
        password,
        identifier: username,
        method: 'password',
      },
    });
  }

  async apiLogout(req: Request) {
    const tokenFromAuthHeader = req.headers['authorization']?.replace(
      'Bearer ',
      ''
    );

    if (!tokenFromAuthHeader) return true;

    return this.frontendClient.performNativeLogout({
      performNativeLogoutBody: {
        session_token: tokenFromAuthHeader,
      },
    });
  }
}

export const ory = new Ory();
