import { httpLogger, logger } from '@csmm/shared';
import cors from '@koa/cors';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import helmet from 'koa-helmet';
import jwt from 'koa-jwt';

import { config } from '../config';
import { protectedRouter } from './protectedRoutes';
import { unprotectedRouter } from './unprotectedRoutes';

export function getHttpServer(): Promise<Koa> {
  return new Promise((resolve) => {
    const app = new Koa();

    // Provides important security headers to make your app more secure
    app.use(helmet.contentSecurityPolicy({
      // These directives are needed to load the Swagger page...
      directives:{
        defaultSrc:['\'self\''],
        scriptSrc:['\'self\'', '\'unsafe-inline\'', 'cdnjs.cloudflare.com'],
        styleSrc:['\'self\'', '\'unsafe-inline\'', 'cdnjs.cloudflare.com', 'fonts.googleapis.com'],
        fontSrc:['\'self\'','fonts.gstatic.com'],
        imgSrc:['\'self\'', 'data:', 'online.swagger.io', 'validator.swagger.io']
      }
  }));
  
    // Enable cors with default options
    app.use(cors());
  
    // Logger middleware -> use winston as logger (logging.ts with config)
    app.use(httpLogger());
  
    // Enable bodyParser with default options
    app.use(bodyParser());
  
    // these routes are NOT protected by the JWT middleware, also include middleware to respond with "Method Not Allowed - 405".
    app.use(unprotectedRouter.routes()).use(unprotectedRouter.allowedMethods());
  
    // JWT middleware -> below this line routes are only reached if JWT token is valid, secret as env variable
    app.use(jwt({ secret: config.jwtSecret }).unless({ path: [/^\/swagger-/] }));
  
    // These routes are protected by the JWT middleware, also include middleware to respond with "Method Not Allowed - 405".
    app.use(protectedRouter.routes()).use(protectedRouter.allowedMethods());
  
    app.listen(config.http.port, () => {
        logger('http').info(`Server running on port ${config.http.port}`);
        resolve(app);
    });
  });
}