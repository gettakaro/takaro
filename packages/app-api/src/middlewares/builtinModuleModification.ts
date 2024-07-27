import { NextFunction, Response } from 'express';
import { errors } from '@takaro/util';
import { AuthenticatedRequest } from '../service/AuthService.js';
import { ModuleService } from '../service/ModuleService.js';

export async function builtinModuleModificationMiddleware(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  const moduleService = new ModuleService(req.domainId);

  const type = req.path.split('/')[1];

  let mod;

  if (req.body.moduleId) {
    mod = await moduleService.findOne(req.body.moduleId);
  } else if (type === 'module') {
    mod = await moduleService.findOne(req.params.id);
  } else {
    mod = await moduleService.findOneBy(type, req.body.commandId || req.params.id);
  }

  if (mod?.builtin) {
    return next(new errors.BadRequestError('Cannot modify builtin modules'));
  }

  next();
}
