import { NextFunction, Response } from 'express';
import { AuthenticatedRequest } from '../service/AuthService.js';
import { errors, logger } from '@takaro/util';
import { DomainService } from '../service/DomainService.js';
import { DOMAIN_STATES } from '../db/domain.js';

export async function domainStateMiddleware(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  if (!req.domainId) {
    return next(new errors.UnauthorizedError());
  }

  const domain = await new DomainService().findOne(req.domainId);

  if (!domain) {
    return next(new errors.NotFoundError());
  }

  switch (domain.state) {
    case DOMAIN_STATES.ACTIVE:
      return next();
    case DOMAIN_STATES.DELETED:
      return next(new errors.NotFoundError('Domain not found'));
    case DOMAIN_STATES.DISABLED:
      return next(new errors.BadRequestError('Domain is disabled. Please contact support.'));
    case DOMAIN_STATES.MAINTENANCE:
      return next(new errors.BadRequestError('Domain is in maintenance mode. Please try again later.'));
    default:
      logger('domainStateMiddleware').warn('Unknown domain state. Allowing request...');
      return next();
  }
}
