import { DomainScoped } from '@takaro/util';
import { ctx, errors, logger, traceableClass } from '@takaro/util';
import { UserOutputWithRolesDTO, UserService, UserUpdateAuthDTO } from '../service/UserService.js';
import jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import { IsString } from 'class-validator';
import ms from 'ms';
import { TakaroDTO } from '@takaro/util';
import { ory, PERMISSIONS } from '@takaro/auth';
import { config } from '../config.js';
import passport from 'passport';
import { REST } from '@discordjs/rest';
import { Routes, RESTGetAPICurrentUserGuildsResult } from 'discord-api-types/v10';
import oauth from 'passport-oauth2';
import { DiscordService } from './DiscordService.js';
import { domainStateMiddleware } from '../middlewares/domainStateMiddleware.js';
import { DomainService } from './DomainService.js';

interface DiscordUserInfo {
  id: string;
  username: string;
  global_name: string;
  avatar: string;
  discriminator: string;
  public_flags: number;
  flags: number;
  banner: string | null;
  banner_color: string | null;
  accent_color: string | null;
  locale: string;
  mfa_enabled: boolean;
  premium_type: number;
  avatar_decoration: string | null;
  email: string;
  verified: boolean;
}
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

  const hasAllPermissions = requiredPermissions.every((permission) => allUserPermissions.includes(permission));

  const userHasRootPermission = allUserPermissions.includes(PERMISSIONS.ROOT);

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
    // TODO: At some point we should refactor our custom JWT and use Ory (Hydra) fully or something...
    if (req.headers['x-takaro-token']) {
      const token = req.headers['x-takaro-token'] as string;
      const payload = await this.verifyJwt(token);
      req.user = { id: payload.sub };
      req.domainId = payload.domainId;

      const service = new UserService(payload.domainId);
      const users = await service.find({ filters: { id: [payload.sub] } });
      if (!users.results.length) return null;
      user = users.results[0];
      await service.update(user.id, new UserUpdateAuthDTO({ lastSeen: new Date().toISOString() }));
    }

    // If we don't have a user yet, try to get it from the IDP
    if (!user) {
      try {
        let domainId = req.cookies ? req.cookies['takaro-domain'] : null;

        const identity = await ory.getIdentityFromReq(req);
        if (!identity) return null;

        // If the client didn't provide a domain hint, we assume the first one.
        if (!domainId) {
          const domains = await domainService.resolveDomainByIdpId(identity.id);
          if (!domains) {
            log.warn(`No domain found for identity ${identity.id}`);
            throw new errors.UnauthorizedError();
          }
          domainId = domains[0].id;

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
          if (!users.results.length) return null;

          user = users.results[0];
          await service.update(user.id, new UserUpdateAuthDTO({ lastSeen: new Date().toISOString() }));
        }
      } catch (error) {
        // Not an ory session, throw a sanitized error
        log.warn(error);
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

        req.user = user;
        req.domainId = user.domain;

        if (domainStateCheck) return domainStateMiddleware(req, _res, next);
        return next();
      } catch (error) {
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

  static initPassport(): string[] {
    const initializedStrategies: string[] = [];
    const discordClientId = config.get('auth.discord.clientId');
    const discordClientSecret = config.get('auth.discord.clientSecret');
    if (discordClientId && discordClientSecret) {
      passport.use(
        'discord',
        new oauth.Strategy(
          {
            clientID: discordClientId,
            clientSecret: discordClientSecret,
            callbackURL: `${config.get('http.baseUrl')}/auth/discord/return`,
            scope: ['identify', 'email', 'guilds'],
            authorizationURL: 'https://discordapp.com/api/oauth2/authorize',
            tokenURL: 'https://discordapp.com/api/oauth2/token',
            passReqToCallback: true,
          },
          async function (
            origReq: Request,
            accessToken: string,
            _refreshToken: string,
            profile: unknown,
            cb: CallableFunction
          ) {
            const req = origReq as AuthenticatedRequest;
            try {
              const rest = new REST({
                version: '10',
                authPrefix: 'Bearer',
              }).setToken(accessToken);

              const userInfo = (await rest.get(Routes.user('@me'))) as DiscordUserInfo;

              if (!userInfo.verified) {
                return cb(
                  new errors.BadRequestError('You must verify your Discord account before you can use it to log in.')
                );
              }

              const service = new UserService(req.domainId);
              const user = await service.findOne(req.user.id);

              if (!user) {
                return cb(new errors.NotFoundError('User not found'));
              }

              await service.update(
                user.id,
                new UserUpdateAuthDTO({
                  discordId: userInfo.id,
                })
              );

              if (
                user.roles.find((r) => r.role.permissions.find((p) => p.permission.permission === PERMISSIONS.ROOT))
              ) {
                const guilds = (await rest.get(Routes.userGuilds())) as RESTGetAPICurrentUserGuildsResult;
                const discordService = new DiscordService(req.domainId);
                await discordService.syncGuilds(guilds);
              }

              return cb(null, user);
            } catch (error) {
              log.error('Error in discord auth', error);
              return cb(error);
            }
          }
        )
      );

      initializedStrategies.push('discord');
    }

    passport.serializeUser(function (user, done) {
      done(null, user);
    });
    passport.deserializeUser(function (obj, done) {
      done(null, null);
    });

    return initializedStrategies;
  }
}
