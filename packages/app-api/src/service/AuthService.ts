import { ctx, errors, logger, traceableClass, DomainScoped, TakaroDTO } from '@takaro/util';
import { UserService } from '../service/User/index.js';
import { UserOutputWithRolesDTO, UserUpdateAuthDTO, UserCreateInternalDTO } from '../service/User/dto.js';
import jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import { IsString } from 'class-validator';
import ms from 'ms';
import { ory, PERMISSIONS } from '@takaro/auth';
import { config } from '../config.js';
import { domainStateMiddleware } from '../middlewares/domainStateMiddleware.js';
import { DOMAIN_STATES, DomainService } from './DomainService.js';
interface IJWTPayload {
  sub: string;
  domainId: string;
}

interface IJWTSignOptions {
  user: { id: string };
}

export interface AuthenticatedRequest extends Request {
  domainId: string;
  user: { id: string };
}

export class LoginOutputDTO extends TakaroDTO<LoginOutputDTO> {
  @IsString()
  token!: string;
}

export class TokenInputDTO extends TakaroDTO<TokenInputDTO> {
  @IsString()
  domainId: string;
}

export class TokenOutputDTO extends TakaroDTO<TokenOutputDTO> {
  @IsString()
  token!: string;
}

export function checkPermissions(requiredPermissions: PERMISSIONS[], user: UserOutputWithRolesDTO): boolean {
  const allUserPermissions = user.roles.reduce((acc, role) => {
    return [...acc, ...role.role.permissions.map((c) => c.permission.permission)];
  }, [] as string[]);

  const allPlayerPermissions = user.player?.roleAssignments.reduce((acc, role) => {
    return [...acc, ...role.role.permissions.map((c) => c.permission.permission)];
  }, [] as string[]);

  const allPermissions = [...allUserPermissions, ...(allPlayerPermissions || [])];
  const hasAllPermissions = requiredPermissions.every((permission) => allPermissions.includes(permission));
  const userHasRootPermission = allPermissions.includes(PERMISSIONS.ROOT);
  return hasAllPermissions || userHasRootPermission;
}

const log = logger('AuthService');
@traceableClass('service:auth')
export class AuthService extends DomainScoped {
  static async login(name: string, password: string): Promise<LoginOutputDTO> {
    try {
      const loginRes = await ory.submitApiLogin(name, password);
      return new LoginOutputDTO({
        token: loginRes.data.session_token,
      });
    } catch (error) {
      log.warn(error);
      throw new errors.UnauthorizedError();
    }
  }

  static async logout(req: Request) {
    return ory.apiLogout(req);
  }

  /**
   * This is a token to be used by app-vmm to execute functions
   * For now, just the root token but in the future, we can have
   * narrower scoped tokens (eg configurable permissions?)
   * // TODO: ^ ^
   */
  async getAgentToken(): Promise<TokenOutputDTO> {
    const userService = new UserService(this.domainId);

    const rootUser = await userService.find({
      filters: { name: ['root'] },
    });

    if (!rootUser.results.length) {
      this.log.error('No root user found');
      throw new errors.InternalServerError();
    }

    const token = await this.signJwt({ user: { id: rootUser.results[0].id } });

    return new TokenOutputDTO({ token });
  }

  async signJwt(payload: IJWTSignOptions): Promise<string> {
    return new Promise((resolve, reject) => {
      const toSign: jwt.JwtPayload = {
        aud: 'takaro',
        sub: payload.user.id,
        domainId: this.domainId,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + ms('5 days') / 1000,
      };

      jwt.sign(toSign, config.get('auth.jwtSecret'), { algorithm: 'HS256', issuer: 'takaro' }, (err, token) => {
        if (err) {
          reject(err);
        }

        if (!token) {
          this.log.error('Token requested but no token came out of the sign method...');
          return reject(new errors.UnauthorizedError());
        }
        resolve(token);
      });
    });
  }

  static async verifyJwt(token?: string): Promise<IJWTPayload> {
    return new Promise((resolve, reject) => {
      if (!token) {
        log.warn('No token provided');
        return reject(new errors.UnauthorizedError());
      }

      jwt.verify(token, config.get('auth.jwtSecret'), { issuer: 'takaro' }, (err, decoded) => {
        if (err) {
          log.warn(err);
          reject(new errors.UnauthorizedError());
        } else {
          resolve(decoded as IJWTPayload);
        }
      });
    });
  }

  static async getUserFromReq(req: AuthenticatedRequest): Promise<UserOutputWithRolesDTO | null> {
    let user: UserOutputWithRolesDTO | null = null;
    const domainService = new DomainService();

    // Either the user is authenticated via the IDP or via a JWT (api client)
    // The token check is 'cheaper' than a request to the IDP so we do it first
    // TODO: At some point we should refactor our custom JWT and/or use Ory (Hydra) fully or something...
    if (req.headers['x-takaro-token']) {
      const token = req.headers['x-takaro-token'] as string;
      const payload = await this.verifyJwt(token);
      req.user = { id: payload.sub };
      req.domainId = payload.domainId;

      const service = new UserService(payload.domainId);
      const users = await service.find({ filters: { id: [payload.sub] } });
      if (!users.results.length) return null;
      user = users.results[0];

      // For JWT auth, we sync Discord ID from Ory to Takaro
      // Ory is the source of truth when it has a Discord ID
      const identity = await ory.getIdentity(user.idpId);

      // Only update if Discord ID changed, Steam ID changed, or lastSeen is older than 1 minute
      const needsUpdate =
        identity.discordId !== user.discordId ||
        identity.steamId !== user.steamId ||
        !user.lastSeen ||
        new Date().getTime() - new Date(user.lastSeen).getTime() > 60000;

      if (needsUpdate) {
        const updateData: any = { lastSeen: new Date().toISOString() };

        // Sync Discord ID if it's different (including removal)
        if (identity.discordId !== user.discordId) {
          updateData.discordId = identity.discordId || undefined;
          log.info('Syncing Discord ID from Ory to Takaro (JWT auth)', {
            userId: user.id,
            oldDiscordId: user.discordId,
            newDiscordId: identity.discordId,
          });
        }

        // Sync Steam ID if it's different (including removal)
        if (identity.steamId !== user.steamId) {
          updateData.steamId = identity.steamId || undefined;
          log.info('Syncing Steam ID from Ory to Takaro (JWT auth)', {
            userId: user.id,
            oldSteamId: user.steamId,
            newSteamId: identity.steamId,
          });
        }

        await service.update(user.id, new UserUpdateAuthDTO(updateData));
      }
    }

    // If we don't have a user yet, try to get it from the IDP
    if (!user) {
      try {
        let domainId = req.cookies ? req.cookies['takaro-domain'] : null;
        if (req.headers['authorization']?.includes('Basic')) {
          delete req.headers['authorization'];
        }
        const identity = await ory.getIdentityFromReq(req);
        if (!identity) return null;

        // If the client didn't provide a domain hint, we assume the first one.
        if (!domainId) {
          const domains = await domainService.resolveDomainByIdpId(identity.id);
          if (!domains) {
            log.warn(`No domain found for identity ${identity.id}`);
            throw new errors.UnauthorizedError();
          }
          // Find the first active domain
          domainId = domains.find((d) => d.state === DOMAIN_STATES.ACTIVE)?.id;

          if (!domainId && domains.length) {
            log.warn(
              `No active domain found for identity (but domains found: ${domains.map((d) => ({ id: d.id, state: d.state })).join(',')})`,
            );
            throw new errors.BadRequestError('Domain is disabled. Please contact support.');
          }

          // Set the domain cookie
          if (req.res?.cookie)
            req.res?.cookie('takaro-domain', domainId, {
              sameSite: config.get('http.domainCookie.sameSite') as boolean | 'strict' | 'lax' | 'none' | undefined,
              secure: config.get('http.domainCookie.secure'),
              domain: config.get('http.domainCookie.domain'),
            });
        }

        if (identity) {
          const service = new UserService(domainId);
          const users = await service.find({ filters: { idpId: [identity.id] } });

          if (!users.results.length) {
            // Create a new user for this identity
            log.info('Creating new Takaro user for identity', {
              identityId: identity.id,
              email: identity.email,
              name: identity.name,
              steamId: identity.steamId,
              domainId,
            });

            const userData = new UserCreateInternalDTO();
            userData.idpId = identity.id;
            userData.name = identity.name || identity.email || `user_${identity.id.substring(0, 8)}`;
            userData.email = identity.email;
            userData.discordId = identity.discordId;
            userData.steamId = identity.steamId;
            userData.isDashboardUser = true;

            user = await service.createInternal(userData);
          } else {
            user = users.results[0];
          }

          // Sync Discord ID from Ory to Takaro
          // Ory is the source of truth when it has a Discord ID

          // Only update if Discord ID changed, Steam ID changed, or lastSeen is older than 1 minute
          if (user) {
            const needsUpdate =
              identity.discordId !== user.discordId ||
              identity.steamId !== user.steamId ||
              !user.lastSeen ||
              new Date().getTime() - new Date(user.lastSeen).getTime() > 60000;

            if (needsUpdate) {
              const updateData: any = { lastSeen: new Date().toISOString() };

              // Sync Discord ID if it's different (including removal)
              if (identity.discordId !== user.discordId) {
                updateData.discordId = identity.discordId || undefined;
                log.info('Syncing Discord ID from Ory to Takaro', {
                  userId: user.id,
                  oldDiscordId: user.discordId,
                  newDiscordId: identity.discordId,
                });
              }

              // Sync Steam ID if it's different (including removal)
              if (identity.steamId !== user.steamId) {
                updateData.steamId = identity.steamId || undefined;
                log.info('Syncing Steam ID from Ory to Takaro', {
                  userId: user.id,
                  oldSteamId: user.steamId,
                  newSteamId: identity.steamId,
                });
              }

              await service.update(user.id, new UserUpdateAuthDTO(updateData));
            }
          }
        }
      } catch (error) {
        // Not an ory session, throw a sanitized error
        log.warn(error);
        // If we explicitly throw a BadRequestError, we want to pass it through
        // So the client gets a meaningful error message
        if (error instanceof errors.BadRequestError) throw error;
        throw new errors.UnauthorizedError();
      }
    }

    return user;
  }

  static getAuthMiddleware(permissions: PERMISSIONS[], domainStateCheck = true) {
    const fn = async (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
      try {
        const user = await this.getUserFromReq(req);

        if (!user) {
          return next(new errors.UnauthorizedError());
        }

        ctx.addData({ user: user.id, domain: user.domain });
        const moduleId = req.headers['x-takaro-module'] as string;
        if (moduleId) {
          ctx.addData({ module: moduleId });
        }

        const hasAllPermissions = checkPermissions(permissions, user);

        if (!hasAllPermissions) {
          log.warn(`User ${user.id} does not have all permissions`);
          return next(new errors.ForbiddenError());
        }

        /**
         * Check if any requested permissions are a MANAGE_* permission
         * If so, the user must be a dashboard user to proceed
         * READ_* permissions are exempt from this check, as player profiles should be able to view and use the shop
         * This is not a auth error exactly, it's a limit with the domains billing plan
         * TODO: we should extend this check in the future, API tokens should pass this check too
         */
        const isRequestingManagePermission = permissions.some((p) => p.startsWith('MANAGE_'));
        const isDashboardUser =
          user.isDashboardUser ||
          user.roles.some((r) => r.role.permissions.some((p) => p.permission.permission === PERMISSIONS.ROOT));
        if (isRequestingManagePermission && !isDashboardUser) {
          log.warn(`User ${user.id} does not have MANAGE_* permissions`);
          return next(new errors.BadRequestError('You must be a dashboard user to perform this action'));
        }

        req.user = user;
        req.domainId = user.domain;

        if (domainStateCheck) return domainStateMiddleware(req, _res, next);
        return next();
      } catch (error) {
        // If we explicitly throw a BadRequestError, we want to pass it through
        // So the client gets a meaningful error message
        if (error instanceof errors.BadRequestError) return next(error);
        log.error('Unexpected error in auth middleware', error);
        return next(new errors.ForbiddenError());
      }
    };

    const name = `authMiddleware(${permissions.join(',')})`;

    Object.defineProperty(fn, 'name', {
      writable: true,
      value: name,
    });

    return fn;
  }
}
