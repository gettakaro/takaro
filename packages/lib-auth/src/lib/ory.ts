import { Configuration, CreateIdentityBody, FrontendApi, IdentityApi, OAuth2Api } from '@ory/client';
import { config } from '../config.js';
import { errors, logger, TakaroDTO } from '@takaro/util';
import { createAxiosClient } from './oryAxiosClient.js';
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

class Ory {
  private authToken: string | null = null;
  private log = logger('ory');

  private adminClient: OAuth2Api;
  private identityClient: IdentityApi;
  private frontendClient: FrontendApi;

  constructor() {
    this.identityClient = new IdentityApi(
      new Configuration({
        basePath: config.get('kratos.adminUrl'),
      }),
      undefined,
      createAxiosClient(config.get('kratos.adminUrl')),
    );

    this.frontendClient = new FrontendApi(
      new Configuration({
        basePath: config.get('kratos.publicUrl'),
      }),
      undefined,
      createAxiosClient(config.get('kratos.publicUrl')),
    );
    this.adminClient = new OAuth2Api(
      new Configuration({
        basePath: config.get('hydra.adminUrl'),
      }),
      undefined,
      createAxiosClient(config.get('hydra.adminUrl')),
    );
  }

  get OAuth2URL() {
    return config.get('hydra.publicUrl');
  }

  async getIdentity(id: string): Promise<ITakaroIdentity> {
    const res = await this.identityClient.getIdentity({
      id,
    });

    return {
      id: res.data.id,
      email: res.data.traits.email,
    };
  }

  async getIdentityByEmail(email: string): Promise<ITakaroIdentity | null> {
    const identity = await this.identityClient.listIdentities({ credentialsIdentifier: email });

    if (!identity.data.length) return null;

    return {
      id: identity.data[0].id,
      email: identity.data[0].traits.email,
    };
  }

  async createIdentity(email: string, password?: string): Promise<ITakaroIdentity> {
    const existing = await this.identityClient.listIdentities({ credentialsIdentifier: email });

    if (existing.data.length) {
      this.log.warn('Identity already exists, returning existing one.', { email });
      return {
        id: existing.data[0].id,
        email: existing.data[0].traits.email,
      };
    }

    const body: CreateIdentityBody = {
      schema_id: IDENTITY_SCHEMA.USER,
      traits: {
        email,
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
    };
  }

  async deleteIdentity(id: string): Promise<void> {
    await this.identityClient.deleteIdentity({
      id,
    });
  }

  async getIdentityFromReq(req: Request): Promise<ITakaroIdentity | null> {
    const tokenFromAuthHeader = req.headers['authorization']?.replace('Bearer ', '');

    try {
      const sessionRes = await this.frontendClient.toSession({
        cookie: req.headers.cookie,
        xSessionToken: tokenFromAuthHeader,
      });

      return {
        id: sessionRes.data.identity!.id,
        email: sessionRes.data.identity!.traits.email,
      };
    } catch (error) {
      this.log.warn('Could not get identity from request', { error });
      return null;
    }
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

    const data = new TakaroTokenDTO({
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
        expires_in: '24h',
      },
    });

    return recoveryRes.data;
  }
}

export const ory = new Ory();
