import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { errors, logger } from '@takaro/util';

const log = logger('http:pagination');

const paginationSchema = z.object({
  page: z.number().min(0).default(0),
  limit: z.number().min(1).max(1000).default(100),
});

export async function paginationMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  const merged = { ...req.query, ...req.body };
  try {
    const result = paginationSchema.parse(merged);

    res.locals.page = result.page;
    res.locals.limit = result.limit;

    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(
        new errors.ValidationError(
          'Invalid pagination',
          error.errors.map((issue) => ({
            property: issue.path.join('.'),
            constraints: { [issue.code]: issue.message },
            value: issue.message,
            children: [],
            errors: error.errors,
          })),
        ),
      );
    } else {
      log.error('Unexpected error', error);
      next(new errors.InternalServerError());
    }
  }
}
