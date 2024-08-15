import { logger, errors } from '@takaro/util';
import { NextFunction, Request, Response } from 'express';
import { config } from '../config.js';

const log = logger('adminAuth');

export function adminAuthMiddleware(request: Request, response: Response, next: NextFunction) {
  try {
    const rawToken = request.headers['x-takaro-admin-token'];

    if (!rawToken) {
      log.warn('No token provided');
      return next(new errors.UnauthorizedError());
    }

    if (!config.get('adminClientSecret')) {
      log.warn('No admin client secret provided');
      return next(new errors.UnauthorizedError());
    }

    if (rawToken !== config.get('adminClientSecret')) {
      log.warn('Invalid admin token');
      return next(new errors.ForbiddenError());
    }

    return next();
  } catch (error) {
    log.error('Unexpected error', { error });
    next(new errors.ForbiddenError());
  }
}
