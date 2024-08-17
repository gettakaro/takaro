import { Configuration, CreateIdentityBody, FrontendApi, IdentityApi } from '@ory/client';
import { config } from '../config.js';
import { logger } from '@takaro/util';
import { createAxiosClient } from './oryAxiosClient.js';
import { Request } from 'express';

enum IDENTITY_SCHEMA {
  USER = 'user_v0',
}

export interface ITakaroIdentity {
  id: string;
  email: string;
}

class Ory {
  private log = logger('ory');

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
