import { NextFunction, Request, Response } from 'express';
import { logger } from '@takaro/logger';
import basicAuth from 'basic-auth';
import { UnauthorizedError } from '../util/errors';

const log = logger('middleware:authAdmin');

export function createAdminAuthMiddleware(adminSecret: string) {
  return function adminAuthMiddleware(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    const credentials = basicAuth(request);

    if (!credentials) {
      log.warn('No credentials provided');
      return next(new UnauthorizedError());
    }

    if (credentials.name !== 'admin') {
      log.warn(`Invalid username: ${credentials.name}`);
      return next(new UnauthorizedError());
    }

    if (credentials.pass !== adminSecret) {
      log.warn('Invalid password');
      return next(new UnauthorizedError());
    }

    return next();
  };
}
