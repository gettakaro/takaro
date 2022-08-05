import { logger } from '@takaro/logger';
import {
  NextFunction,
  Request,
  RequestHandler,
  Response,
  Application,
} from 'express';

type httpMethods =
  | 'get'
  | 'post'
  | 'put'
  | 'delete'
  | 'patch'
  | 'options'
  | 'head';

interface IRoute {
  handler: RequestHandler;
  method: httpMethods | httpMethods[];
  path: string;
}

export class Route {
  private logger;

  constructor(private route: IRoute) {
    this.logger = logger('route');
  }

  load(app: Application) {
    if (Array.isArray(this.route.method)) {
      for (const method of this.route.method) {
        this.logger.debug(`Registering ${method} ${this.route.path}`);
        app[method](this.route.path, this.handler.bind(this));
      }
    } else {
      this.logger.debug(`Registering ${this.route.method} ${this.route.path}`);
      app[this.route.method](this.route.path, this.handler.bind(this));
    }
  }

  async handler(req: Request, res: Response, next: NextFunction) {
    try {
      await this.route.handler(req, res, next);
      next();
    } catch (error) {
      return next(error);
    }
  }
}
