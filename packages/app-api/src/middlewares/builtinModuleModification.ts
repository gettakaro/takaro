import { NextFunction, Response } from 'express';
import { errors, logger } from '@takaro/util';
import { AuthenticatedRequest } from '../service/AuthService.js';
import { ModuleService } from '../service/Module/index.js';

const log = logger('middleware:module');

export async function builtinModuleModificationMiddleware(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const moduleService = new ModuleService(req.domainId);

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
          mod = await moduleService.findOne(moduleVersion.moduleId);
        }
      }
    } else {
      const moduleVersion = await moduleService.findOneBy(type, req.body.commandId || req.params.id);
      if (moduleVersion) {
        mod = await moduleService.findOne(moduleVersion.moduleId);
      }
    }

    if (mod?.builtin) {
      return next(new errors.BadRequestError('Cannot modify builtin modules'));
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
