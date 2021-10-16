import { SwaggerRouter } from 'koa-swagger-decorator';

import { user } from './controller';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const packageJson = require('../../package.json');

const protectedRouter = new SwaggerRouter();

// USER ROUTES
protectedRouter.get('/users', user.getUsers);

// Swagger endpoint
protectedRouter.swagger({
    title: 'CSMM',
    description: 'Game server manager',
    version: packageJson.version,
});

// mapDir will scan the input dir, and automatically call router.map to all Router Class
protectedRouter.mapDir(__dirname, {ignore: ['./**/*.test.ts']});

export { protectedRouter };