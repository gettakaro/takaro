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
  stripeId?: string;
  steamId?: string;
  discordId?: string;
  name?: string;
  hasPassword?: boolean;
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
      includeCredential: ['oidc', 'password'],
    });

    // Extract Discord ID from OIDC credentials
    let discordId: string | undefined;
    if (res.data.credentials?.oidc?.identifiers) {
      const discordIdentifier = res.data.credentials.oidc.identifiers.find((identifier: string) =>
        identifier.startsWith('discord:'),
      );
      if (discordIdentifier) {
        discordId = discordIdentifier.replace('discord:', '');
      }
    }

    // Extract Steam ID from OIDC credentials (not traits)
    let steamId: string | undefined;
    if (res.data.credentials?.oidc?.identifiers) {
      const steamIdentifier = res.data.credentials.oidc.identifiers.find((identifier: string) =>
        identifier.startsWith('steam:'),
      );
      if (steamIdentifier) {
        steamId = steamIdentifier.replace('steam:', '');
      }
    }

    // Check if password credentials exist AND are actually configured
    // Recovery flows create password credentials but without a password hash
    const hasPassword = !!(
      res.data.credentials?.password &&
      res.data.credentials.password.config &&
      Object.keys(res.data.credentials.password.config).length > 0
    );

    return {
      id: res.data.id,
      email: res.data.traits.email,
      stripeId: res.data.traits.stripeId,
      steamId: steamId || res.data.traits.steamId, // Use OIDC steamId first, fall back to traits
      discordId,
      name: res.data.traits.name,
      hasPassword,
    };
  }

  async getIdentityByEmail(email: string): Promise<ITakaroIdentity | null> {
    const identity = await this.identityClient.listIdentities({ credentialsIdentifier: email });

    if (!identity.data.length) return null;

    // We need to fetch the full identity to get credentials
    return this.getIdentity(identity.data[0].id);
  }

  async getIdentityBySteamId(steamId: string): Promise<ITakaroIdentity | null> {
    // Search using credentialsIdentifier which is indexed and efficient
    const identities = await this.identityClient.listIdentities({
      credentialsIdentifier: steamId,
    });

    if (!identities.data.length) return null;

    // Get the full identity with credentials
    return this.getIdentity(identities.data[0].id);
  }

  async createIdentity(email: string, password?: string): Promise<ITakaroIdentity> {
    const existing = await this.identityClient.listIdentities({ credentialsIdentifier: email });

    if (existing.data.length) {
      this.log.warn('Identity already exists, returning existing one.', { email });
      // Return the full identity with credentials
      return this.getIdentity(existing.data[0].id);
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

    // Return the newly created identity (won't have Discord ID yet)
    return {
      id: res.data.id,
      email: res.data.traits.email,
      stripeId: res.data.traits.stripeId,
      steamId: res.data.traits.steamId,
      discordId: undefined,
      name: res.data.traits.name,
      hasPassword: !!password,
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

      // Session response doesn't include credentials, so we need to fetch the full identity
      return this.getIdentity(sessionRes.data.identity!.id);
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
