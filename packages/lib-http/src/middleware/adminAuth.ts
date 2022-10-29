import { NextFunction, Request, Response } from 'express';
import { logger, errors } from '@takaro/util';
import basicAuth from 'basic-auth';

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
      return next(new errors.UnauthorizedError());
    }

    if (credentials.name !== 'admin') {
      log.warn(`Invalid username: ${credentials.name}`);
      return next(new errors.UnauthorizedError());
    }

    if (credentials.pass !== adminSecret) {
      log.warn('Invalid password');
      return next(new errors.UnauthorizedError());
    }

    return next();
  };
}
