import { NextFunction, Request, Response } from 'express';
import * as yup from 'yup';
import { errors, logger } from '@takaro/util';

const log = logger('http:pagination');

const paginationSchema = yup.object({
  page: yup.number().default(0).min(0),
  limit: yup.number().default(100).min(1).max(1000),
});

export async function paginationMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  const merged = { ...req.query, ...req.body };
  try {
    const result = await paginationSchema.validate(merged);

    res.locals.page = result.page;
    res.locals.limit = result.limit;

    next();
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      next(new errors.ValidationError('Invalid pagination', [error]));
    } else {
      log.error('Unexpected error', error);
      next(new errors.InternalServerError());
    }
  }
}
