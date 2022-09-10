import { DomainScoped } from '../lib/DomainScoped';
import { errors, logger } from '@takaro/logger';
import { compare } from 'bcrypt';
import { UserService } from '../service/UserService';
import * as jwt from 'jsonwebtoken';
import { config } from '../config';
import { NextFunction, Request, Response } from 'express';
import { CAPABILITIES } from '../db/role';

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

const log = logger('AuthService');

export class AuthService extends DomainScoped {
  async login(email: string, password: string) {
    const service = new UserService(this.domainId);
    const users = await service.find({ filters: { email } });

    if (!users.length) {
      this.log.warn('User not found');
      throw new errors.UnauthorizedError();
    }

    if (users.length > 1) {
      this.log.error('Too many users found!');
      throw new errors.UnauthorizedError();
    }

    const passwordMatches = await compare(password, users[0].password);

    if (passwordMatches) {
      return { token: await this.signJwt({ user: { id: users[0].id } }) };
    } else {
      this.log.warn('Password does not match');
      throw new errors.UnauthorizedError();
    }
  }

  async signJwt(payload: IJWTSignOptions): Promise<string> {
    return new Promise((resolve, reject) => {
      const toSign: jwt.JwtPayload = {
        aud: 'takaro',
        sub: payload.user.id,
        domainId: this.domainId,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 60 * 10,
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

  static getAuthMiddleware(capabilities: CAPABILITIES[]) {
    return async (
      req: AuthenticatedRequest,
      res: Response,
      next: NextFunction
    ) => {
      try {
        const token = req.headers['authorization']?.replace('Bearer ', '');
        const payload = await AuthService.verifyJwt(token);
        const service = new UserService(payload.domainId);
        const user = await service.findOne(payload.sub);

        if (!user) {
          return next(new errors.UnauthorizedError());
        }

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
