import {
  Configuration,
  FrontendApi,
  IdentityApi,
  OAuth2Api,
} from '@ory/client';
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

  async introspectToken(token: string): Promise<TakaroTokenDTO> {
    const introspectRes = await this.adminClient.introspectOAuth2Token({
      token,
    });

    const data = await new TakaroTokenDTO().construct({
      active: introspectRes.data.active,
      clientId: introspectRes.data.client_id,
      exp: introspectRes.data.exp,
      iat: introspectRes.data.iat,
      iss: introspectRes.data.iss,
      sub: introspectRes.data.sub,
    });

    // Check for correctness of the data
    // DOES NOT CHECK FOR EXPIRATION
    await data.validate();

    return data;
  }
}

export const ory = new Ory();
