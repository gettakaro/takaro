import { NextFunction, Response } from 'express';
import { errors, logger } from '@takaro/util';
import { AuthenticatedRequest } from '../service/AuthService.js';
import { ModuleService } from '../service/Module/index.js';
import { ModuleVersionOutputDTO } from '../service/Module/dto.js';

const log = logger('middleware:module');

/**
 * For several reasons (Builtin module, tagged version) you cannot edit modules
 * This middleware checks those conditions and blocks the request if necessary
 * @param req
 * @param _res
 * @param next
 * @returns
 */
export async function moduleProtectionMiddleware(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const moduleService = new ModuleService(req.domainId);
    let targetedVersion: ModuleVersionOutputDTO | null = null;

    const type = req.path.split('/')[1];

    let mod;

    if (req.body.moduleId) {
      mod = await moduleService.findOne(req.body.moduleId);
    } else if (type === 'module') {
      try {
        mod = await moduleService.findOne(req.params.id);
      } catch (error) {
        if (error instanceof errors.NotFoundError) {
          // Not a module we're interested in
        } else {
          throw error;
        }
      }
      // The ID could also be a versionId
      if (!mod) {
        const moduleVersion = await moduleService.findOneVersion(req.params.id);
        if (moduleVersion) {
          targetedVersion = moduleVersion;
          mod = await moduleService.findOne(moduleVersion.moduleId);
        }
      }
    } else if (req.body.versionId) {
      const moduleVersion = await moduleService.findOneVersion(req.body.versionId);
      if (moduleVersion) {
        targetedVersion = moduleVersion;
        mod = await moduleService.findOne(moduleVersion.moduleId);
      }
    } else {
      const moduleVersion = await moduleService.findOneBy(type, req.body.commandId || req.params.id);
      if (moduleVersion) {
        targetedVersion = moduleVersion;
        mod = await moduleService.findOne(moduleVersion.moduleId);
      }
    }

    if (targetedVersion && targetedVersion.tag !== 'latest') {
      return next(
        new errors.BadRequestError('Cannot modify a tagged version of a module, edit the "latest" version instead'),
      );
    }

    next();
  } catch (error) {
    if (error instanceof errors.NotFoundError) {
      // Not a module we're interested in
      return next();
    }
    log.error('Unexpected error in builtinModuleModificationMiddleware', error);
    next(new errors.InternalServerError());
  }
}
