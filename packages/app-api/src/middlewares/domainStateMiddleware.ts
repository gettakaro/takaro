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
    logger('domainStateMiddleware').warn('[CONCURRENT_TESTS_DEBUG] Domain lookup failed in middleware', {
      requestedDomainId: req.domainId,
      path: req.path,
    });
    return next(new errors.NotFoundError());
  }

  logger('domainStateMiddleware').debug('[CONCURRENT_TESTS_DEBUG] Domain state check in middleware', {
    domainId: domain.id,
    domainName: domain.name,
    state: domain.state,
    path: req.path,
  });

  // Force console.log to bypass test mode logging suppression
  console.log('[CONCURRENT_TESTS_DEBUG] RAW DOMAIN STATE IN MIDDLEWARE:', {
    domainId: domain.id,
    domainName: domain.name,
    stateValue: domain.state,
    stateType: typeof domain.state,
    stateIsNull: domain.state === null,
    stateIsUndefined: domain.state === undefined,
    stateString: String(domain.state),
    allDomainFields: Object.keys(domain),
    path: req.path,
  });

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
