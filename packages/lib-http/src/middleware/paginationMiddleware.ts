import { NextFunction, Request, Response } from 'express';
import * as yup from 'yup';
import { errors, logger } from '@takaro/util';
import { ExpressMiddlewareInterface, Middleware } from 'routing-controllers';

const log = logger('http:pagination');

const paginationSchema = yup.object({
  page: yup.number().default(0).min(0),
  limit: yup.number().default(100).min(1).max(1000),
});

export interface PaginatedRequest extends Request {
  page: number;
  limit: number;
}

@Middleware({ type: 'before' })
export class PaginationMiddleware implements ExpressMiddlewareInterface {
  async use(req: PaginatedRequest, res: Response, next: NextFunction) {
    const merged = { ...req.query, ...req.body };
    try {
      const result = await paginationSchema.validate(merged);
      req.page = result.page;
      req.limit = result.limit;
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
}
