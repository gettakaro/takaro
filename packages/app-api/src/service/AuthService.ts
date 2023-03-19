import { DomainScoped } from '../lib/DomainScoped.js';
import { ctx, errors, logger } from '@takaro/util';
import { UserOutputWithRolesDTO, UserService } from '../service/UserService.js';
import jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import { IsString } from 'class-validator';
import ms from 'ms';
import { TakaroDTO } from '@takaro/util';
import { ory, PERMISSIONS } from '@takaro/auth';

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

const log = logger('AuthService');

export class AuthService extends DomainScoped {
  static async login(name: string, password: string): Promise<LoginOutputDTO> {
    try {
      const loginRes = await ory.submitApiLogin(name, password);
      return new LoginOutputDTO().construct({
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
   * This is a token to be used by app-agent to execute functions
   * For now, just the root token but in the future, we can have
   * narrower scoped tokens (eg configurable permissions?)
   * // TODO: ^ ^
   */
  async getAgentToken(): Promise<TokenOutputDTO> {
    const userService = new UserService(this.domainId);

    const rootUser = await userService.find({
      filters: { name: 'root' },
    });

    if (!rootUser.results.length) {
      this.log.error('No root user found');
      throw new errors.InternalServerError();
    }

    const token = await this.signJwt({ user: { id: rootUser.results[0].id } });

    return new TokenOutputDTO().construct({ token });
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

      jwt.sign(
        toSign,
        "config.get('auth.jwtSecret')",
        { algorithm: 'HS256', issuer: 'takaro' },
        (err, token) => {
          if (err) {
            reject(err);
          }

          if (!token) {
            this.log.error(
              'Token requested but no token came out of the sign method...'
            );
            return reject(new errors.UnauthorizedError());
          }
          resolve(token);
        }
      );
    });
  }

  static async verifyJwt(token?: string): Promise<IJWTPayload> {
    return new Promise((resolve, reject) => {
      if (!token) {
        log.warn('No token provided');
        return reject(new errors.UnauthorizedError());
      }

      jwt.verify(
        token,
        "config.get('auth.jwtSecret')",
        { issuer: 'takaro' },
        (err, decoded) => {
          if (err) {
            log.warn(err);
            reject(new errors.UnauthorizedError());
          } else {
            resolve(decoded as IJWTPayload);
          }
        }
      );
    });
  }

  static async getUserFromReq(
    req: AuthenticatedRequest
  ): Promise<UserOutputWithRolesDTO | null> {
    try {
      const identity = await ory.getIdentityFromReq(req);
      if (!identity) return null;
      const service = new UserService(identity.domainId);
      const users = await service.find({ filters: { idpId: identity.id } });

      if (!users.results.length) return null;

      return users.results[0];
    } catch (error) {
      return null;
    }
  }

  static getAuthMiddleware(permissions: PERMISSIONS[]) {
    return async (
      req: AuthenticatedRequest,
      res: Response,
      next: NextFunction
    ) => {
      try {
        const user = await this.getUserFromReq(req);

        if (!user) {
          return next(new errors.UnauthorizedError());
        }

        ctx.addData({ user: user.id, domain: user.domain });

        const allUserPermissions = user.roles.reduce((acc, role) => {
          return [...acc, ...role.permissions.map((c) => c.permission)];
        }, [] as PERMISSIONS[]);

        const hasAllPermissions = permissions.every((permission) =>
          allUserPermissions.includes(permission)
        );

        const userHasRootPermission = allUserPermissions.includes(
          PERMISSIONS.ROOT
        );

        if (!hasAllPermissions && !userHasRootPermission) {
          log.warn(`User ${user.id} does not have all permissions`);
          return next(new errors.ForbiddenError());
        }

        req.user = user;
        req.domainId = user.domain;
        next();
      } catch (error) {
        log.error('Unexpected error in auth middleware', error);
        return next(new errors.ForbiddenError());
      }
    };
  }
}
