import { Request, Response, NextFunction } from 'express';
import { errors, logger } from '@takaro/util';
import { ory } from '@takaro/auth';

const log = logger('http:middleware:adminAuth');

export async function adminAuthMiddleware(
  request: Request,
  response: Response,
  next: NextFunction
) {
  try {
    const rawToken = request.headers['authorization']?.replace('Bearer ', '');

    if (!rawToken) {
      log.warn('No token provided');
      return next(new errors.UnauthorizedError());
    }

    const token = await ory.introspectToken(rawToken);

    if (!token.active) {
      log.warn('Token is not active');
      return next(new errors.UnauthorizedError());
    }

    return next();
  } catch (error) {
    log.error('Unexpected error', { error });
    next(new errors.UnauthorizedError());
  }
}
