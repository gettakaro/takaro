import { DomainScoped } from '../lib/DomainScoped.js';
import { ctx, errors, logger } from '@takaro/util';
import { compareHashed } from '@takaro/db';
import { UserService } from '../service/UserService.js';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { NextFunction, Request, Response } from 'express';
import { IsString } from 'class-validator';
import ms from 'ms';
import { TakaroDTO } from '@takaro/util';
import { CAPABILITIES } from './RoleService.js';

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

const log = logger('AuthService');

export class AuthService extends DomainScoped {
  async login(
    email: string,
    password: string,
    res: Response
  ): Promise<LoginOutputDTO> {
    const service = new UserService(this.domainId);
    const users = await service.find({ filters: { email } });

    if (!users.results.length) {
      this.log.warn('User not found');
      throw new errors.UnauthorizedError();
    }

    if (users.results.length > 1) {
      this.log.error('Too many users found!');
      throw new errors.UnauthorizedError();
    }

    const passwordMatches = await compareHashed(
      password,
      users.results[0].password
    );

    if (passwordMatches) {
      const token = await this.signJwt({ user: { id: users.results[0].id } });
      res.cookie(config.get('auth.cookieName'), token, {
        httpOnly: true,
        maxAge: ms(config.get('auth.jwtExpiresIn')),
      });

      return new LoginOutputDTO().construct({ token });
    } else {
      this.log.warn('Password does not match');
      throw new errors.UnauthorizedError();
    }
  }

  static async logout(res: Response) {
    res.clearCookie(config.get('auth.cookieName'));
  }

  /**
   * This is a token to be used by app-agent to execute functions
   * For now, just the root token but in the future, we can have
   * narrower scoped tokens (eg configurable capabilities?)
   * // TODO: ^ ^
   */
  async getAgentToken() {
    const userService = new UserService(this.domainId);

    const rootUser = await userService.find({
      filters: { name: 'root' },
    });

    if (!rootUser.results.length) {
      this.log.error('No root user found');
      throw new errors.InternalServerError();
    }

    return await this.signJwt({ user: { id: rootUser.results[0].id } });
  }

  async signJwt(payload: IJWTSignOptions): Promise<string> {
    return new Promise((resolve, reject) => {
      const toSign: jwt.JwtPayload = {
        aud: 'takaro',
        sub: payload.user.id,
        domainId: this.domainId,
        iat: Math.floor(Date.now() / 1000),
        exp:
          Math.floor(Date.now() / 1000) +
          ms(config.get('auth.jwtExpiresIn')) / 1000,
      };

      jwt.sign(
        toSign,
        config.get('auth.jwtSecret'),
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
        config.get('auth.jwtSecret'),
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

  static getTokenFromRequest(req: AuthenticatedRequest) {
    const tokenFromAuthHeader = req.headers['authorization']?.replace(
      'Bearer ',
      ''
    );
    const tokenFromCookie = req.cookies[config.get('auth.cookieName')];
    return tokenFromAuthHeader || tokenFromCookie;
  }

  static getAuthMiddleware(capabilities: CAPABILITIES[]) {
    return async (
      req: AuthenticatedRequest,
      res: Response,
      next: NextFunction
    ) => {
      try {
        const token = this.getTokenFromRequest(req);
        const payload = await AuthService.verifyJwt(token);
        const service = new UserService(payload.domainId);
        const user = await service.findOne(payload.sub);

        if (!user) {
          return next(new errors.UnauthorizedError());
        }

        ctx.addData({ user: user.id, domain: payload.domainId });

        const allUserCapabilities = user.roles.reduce((acc, role) => {
          return [...acc, ...role.capabilities.map((c) => c.capability)];
        }, [] as CAPABILITIES[]);

        const hasAllCapabilities = capabilities.every((capability) =>
          allUserCapabilities.includes(capability)
        );

        const userHasRootCapability = allUserCapabilities.includes(
          CAPABILITIES.ROOT
        );

        if (!hasAllCapabilities && !userHasRootCapability) {
          log.warn(`User ${user.id} does not have all capabilities`);
          return next(new errors.ForbiddenError());
        }

        req.user = user;
        req.domainId = payload.domainId;
        next();
      } catch (error) {
        log.error('Unexpected error in auth middleware', error);
        return next(new errors.ForbiddenError());
      }
    };
  }
}
