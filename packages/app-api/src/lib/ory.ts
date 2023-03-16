import { Configuration, FrontendApi, IdentityApi } from '@ory/client';
import { Request } from 'express';
import { config } from '../config.js';
import axios, { AxiosError } from 'axios';
import { errors, logger } from '@takaro/util';

enum IDENTITY_SCHEMA {
  USER = 'user_v0',
}

export interface ITakaroIdentity {
  id: string;
  email: string;
  domainId: string;
}

async function* paginateIdentities(
  adminClient: IdentityApi,
  page = 1,
  perPage = 100
) {
  let currentPage = page;

  while (true) {
    const response = await adminClient.listIdentities({
      page: currentPage,
      perPage,
    });

    if (response.data.length === 0) {
      // Stop the iteration if there are no more items
      break;
    }

    yield response.data;

    currentPage++;
  }
}

export class Ory {
  private adminClient: IdentityApi;
  private frontendClient: FrontendApi;
  private log = logger('ory');
  constructor() {
    this.adminClient = new IdentityApi(
      new Configuration({
        basePath: config.get('auth.kratosUrlAdmin'),
      }),
      undefined,
      this.createAxiosClient(config.get('auth.kratosUrlAdmin'))
    );

    this.frontendClient = new FrontendApi(
      new Configuration({
        basePath: config.get('auth.kratosUrlPublic'),
      }),
      undefined,
      this.createAxiosClient(config.get('auth.kratosUrlPublic'))
    );
  }

  private createAxiosClient(baseURL: string) {
    const client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Takaro-API',
      },
    });

    client.interceptors.request.use((request) => {
      this.log.info(`➡️ ${request.method?.toUpperCase()} ${request.url}`, {
        method: request.method,
        url: request.url,
      });
      return request;
    });

    client.interceptors.response.use(
      (response) => {
        this.log.info(
          `⬅️ ${response.request.method?.toUpperCase()} ${
            response.request.path
          } ${response.status} ${response.statusText}`,
          {
            status: response.status,
            statusText: response.statusText,
            method: response.request.method,
            url: response.request.url,
          }
        );

        return response;
      },
      (error: AxiosError) => {
        let details = {};

        if (error.response?.data) {
          const data = error.response.data as Record<string, unknown>;
          details = JSON.stringify(data.error);
        }

        this.log.error(
          `☠️ Request errored: [${error.response?.status}] ${details}`,
          {
            error,
            details,
            status: error.response?.status,
            statusText: error.response?.statusText,
            method: error.config?.method,
            url: error.config?.url,
            headers: error.response?.headers,
            response: error.response?.data,
          }
        );
        return Promise.reject(error);
      }
    );

    return client;
  }

  async deleteIdentitiesForDomain(domainId: string) {
    for await (const identities of paginateIdentities(this.adminClient)) {
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
    const res = await this.adminClient.getIdentity({
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
    const res = await this.adminClient.createIdentity({
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
    await this.adminClient.deleteIdentity({
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

function metadataTypeguard(
  metadata: unknown
): metadata is { domainId: string } {
  return (
    typeof metadata === 'object' && metadata !== null && 'domainId' in metadata
  );
}
