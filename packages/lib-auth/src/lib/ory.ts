import { Configuration, CreateIdentityBody, FrontendApi, IdentityApi, OAuth2Api } from '@ory/client';
import { config } from '../config.js';
import { errors, logger, TakaroDTO } from '@takaro/util';
import { AdminClient as TakaroClient } from '@takaro/apiclient';
import { createAxiosClient } from './oryAxiosClient.js';
import { paginateIdentities } from './paginationHelpers.js';
import { Request } from 'express';
import { IsBoolean, IsNumber, IsString } from 'class-validator';

enum IDENTITY_SCHEMA {
  USER = 'user_v0',
}

export enum AUDIENCES {
  // Used for various sysadmin tasks in the Takaro API
  TAKARO_API_ADMIN = 't:api:admin',
}

export interface ITakaroIdentity {
  id: string;
  email: string;
  domainId: string;
}

export class TakaroTokenDTO extends TakaroDTO<TakaroTokenDTO> {
  @IsBoolean()
  active: boolean;
  @IsString()
  clientId: string;
  @IsNumber()
  exp: number;
  @IsNumber()
  iat: number;
  @IsString()
  iss: string;
  @IsString()
  sub: string;
  @IsString({ each: true })
  aud: string[];
}

function metadataTypeguard(metadata: unknown): metadata is { domainId: string } {
  return typeof metadata === 'object' && metadata !== null && 'domainId' in metadata;
}

class Ory {
  private authToken: string | null = null;
  private log = logger('ory');

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
        basePath: config.get('kratos.publicUrl'),
      }),
      undefined,
      createAxiosClient(config.get('kratos.publicUrl'))
    );
    this.adminClient = new OAuth2Api(
      new Configuration({
        basePath: config.get('hydra.adminUrl'),
      }),
      undefined,
      createAxiosClient(config.get('hydra.adminUrl'))
    );
  }

  get OAuth2URL() {
    return config.get('hydra.publicUrl');
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
      this.log.warn('Identity metadata_public is not of type {domainId: string}', { identity: res.data.id });
      throw new errors.ForbiddenError();
    }

    return {
      id: res.data.id,
      email: res.data.traits.email,
      domainId: res.data.metadata_public.domainId,
    };
  }

  async createIdentity(email: string, domainId: string, password?: string): Promise<ITakaroIdentity> {
    const body: CreateIdentityBody = {
      schema_id: IDENTITY_SCHEMA.USER,
      traits: {
        email,
      },
      metadata_public: {
        domainId,
      },

    };

    if (password) {
      body.credentials = {
        password: {
          config: {
            password,
          },
        },
      };
    }

    const res = await this.identityClient.createIdentity({
      createIdentityBody: body,
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
    const tokenFromAuthHeader = req.headers['authorization']?.replace('Bearer ', '');

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
      this.log.warn('Identity metadata_public is not of type {domainId: string}', {
        identity: sessionRes.data.identity.id,
      });
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
    const tokenFromAuthHeader = req.headers['authorization']?.replace('Bearer ', '');

    if (!tokenFromAuthHeader) return true;

    return this.frontendClient.performNativeLogout({
      performNativeLogoutBody: {
        session_token: tokenFromAuthHeader,
      },
    });
  }

  async introspectToken(token: string): Promise<TakaroTokenDTO> {
    const introspectRes = await this.adminClient.introspectOAuth2Token({
      token,
    });

    const data = await new TakaroTokenDTO().construct({
      active: introspectRes.data.active,
      clientId: introspectRes.data.client_id,
      aud: introspectRes.data.aud,
      exp: introspectRes.data.exp,
      iat: introspectRes.data.iat,
      iss: introspectRes.data.iss,
      sub: introspectRes.data.sub,
    });

    try {
      // Check for correctness of the data
      // DOES NOT CHECK FOR EXPIRATION
      await data.validate();
    } catch (error) {
      this.log.warn('Introspected token has invalid shape', { error });
      throw new errors.ForbiddenError();
    }

    return data;
  }

  // Currently, this is only used for creating the admin-auth client.
  // ...In the future we should make this more generic and allow for
  // creating any API client perhaps?
  async createOIDCClient(): Promise<{
    clientId: string;
    clientSecret: string;
  }> {
    const client = await this.adminClient.createOAuth2Client({
      oAuth2Client: {
        grant_types: ['client_credentials'],
        audience: [AUDIENCES.TAKARO_API_ADMIN],
      },
    });

    if (!client.data.client_id || !client.data.client_secret) {
      this.log.error('Could not create OIDC client', { client });
      throw new errors.InternalServerError();
    }

    return {
      clientId: client.data.client_id,
      clientSecret: client.data.client_secret,
    };
  }

  async getRecoveryFlow(id: string) {
    const recoveryRes = await this.identityClient.createRecoveryLinkForIdentity({
      createRecoveryLinkForIdentityBody: {
        identity_id: id,
        expires_in: '12h',
      }
    });

    return recoveryRes.data;
  }

}

export const ory = new Ory();
