import { NextFunction, Response } from 'express';
import { errors, logger } from '@takaro/util';
import { AuthenticatedRequest } from '../service/AuthService.js';
import { ModuleService } from '../service/Module/index.js';
import { ModuleOutputDTO, ModuleVersionOutputDTO } from '../service/Module/dto.js';
import { DomainService } from '../service/DomainService.js';

const log = logger('middleware:module');

async function determineModule(
  req: AuthenticatedRequest,
): Promise<{ mod: ModuleOutputDTO; version?: ModuleVersionOutputDTO } | null> {
  try {
    const moduleService = new ModuleService(req.domainId);
    let mod: ModuleOutputDTO | undefined;

    // Case 1: Direct module ID in request body
    if (req.body.moduleId) {
      mod = await moduleService.findOne(req.body.moduleId);
      return mod ? { mod } : null;
    }

    // Case 2: Module or version ID in URL path
    const type = req.path.split('/')[1];
    if (type === 'module' && req.params.id) {
      try {
        mod = await moduleService.findOne(req.params.id);
        return mod ? { mod } : null;
      } catch (error) {
        if (!(error instanceof errors.NotFoundError)) {
          throw error;
        }

        // Check if the ID is a version ID instead
        const moduleVersion = await moduleService.findOneVersion(req.params.id);
        if (moduleVersion) {
          mod = await moduleService.findOne(moduleVersion.moduleId);
          return mod ? { mod, version: moduleVersion } : null;
        }
      }
    }

    // Case 3: Version ID in request body
    if (req.body.versionId) {
      const moduleVersion = await moduleService.findOneVersion(req.body.versionId);
      if (moduleVersion) {
        mod = await moduleService.findOne(moduleVersion.moduleId);
        return mod ? { mod, version: moduleVersion } : null;
      }
    }

    // Case 4: Find by type and command/param ID
    const moduleVersion = await moduleService.findOneBy(type, req.body.commandId || req.params.id);
    if (moduleVersion) {
      mod = await moduleService.findOne(moduleVersion.moduleId);
      return mod ? { mod, version: moduleVersion } : null;
    }

    return null;
  } catch (error) {
    log.error('Unexpected error in determineModule', error);
    return null;
  }
}

/**
 * Middleware that prevents modifications to builtin modules and tagged versions.
 * @param req - Authenticated request
 * @param _res - Response object
 * @param next - Next middleware function
 */
export async function moduleProtectionMiddleware(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  if (!req.domainId) return next(new errors.BadRequestError('Domain ID not found'));
  try {
    const result = await determineModule(req);

    if (!result) {
      return next();
    }

    const { mod, version } = result;

    if (mod.builtin) {
      return next(new errors.BadRequestError('Cannot modify builtin modules'));
    }

    if (version && version.tag !== 'latest') {
      return next(
        new errors.BadRequestError('Cannot modify a tagged version of a module, edit the "latest" version instead'),
      );
    }

    return moduleLimitProtectionMiddleware(mod, req, _res, next);
  } catch (error) {
    log.error('Unexpected error in moduleProtectionMiddleware', error);
    next(new errors.InternalServerError());
  }
}

/**
 * Middleware to check if a module has reached the domain limits
 * Eg: when creating new functions, there is a limit.
 */
export async function moduleLimitProtectionMiddleware(
  mod: ModuleOutputDTO,
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  if (!req.domainId) return next(new errors.BadRequestError('Domain ID not found'));
  try {
    // If the request is a DELETE or GET request, skip the limit check
    // DELETE's are allowed, otherwise people get stuck with their filled module
    if (req.method === 'DELETE' || req.method === 'GET') {
      return next();
    }

    // Check if the module has reached the domain limits
    const domainService = new DomainService();
    const domain = await domainService.findOne(req.domainId);
    if (!domain) throw new errors.NotFoundError('Domain not found');
    const { maxFunctionsInModule } = domain;

    // Find out the total number of functions in the module
    const moduleService = new ModuleService(req.domainId);
    // Edits can only happen to the latest version, so we only need to check that
    const latestVersion = await moduleService.getLatestVersion(mod.id);
    const total =
      latestVersion.commands.length +
      latestVersion.hooks.length +
      latestVersion.cronJobs.length +
      latestVersion.functions.length;

    if (total >= maxFunctionsInModule) {
      return next(new errors.BadRequestError(`This module has reached the limit of ${maxFunctionsInModule} functions`));
    }

    next();
  } catch (error) {
    log.error('Unexpected error in moduleLimitProtection', error);
    next(new errors.InternalServerError());
  }
}
