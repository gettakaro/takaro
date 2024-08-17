import { Response, NextFunction, Request } from 'express';
import { Redis } from '@takaro/db';
import { expect } from '@takaro/test';
import { Controller, UseBefore, Get } from 'routing-controllers';
import { HTTP } from '../../main.js';
import { createRateLimitMiddleware } from '../rateLimit.js';
import { ctx } from '@takaro/util';
import supertest from 'supertest';

describe('rateLimit middleware', () => {
  let http: HTTP;
  beforeEach(async () => {
    @Controller()
    class TestController {
      @Get('/low-limit')
      @UseBefore(
        await createRateLimitMiddleware({
          max: 5,
          windowSeconds: 5,
          useInMemory: false,
        }),
      )
      getLow() {
        return 'Hello World';
      }

      @Get('/high-limit')
      @UseBefore(
        await createRateLimitMiddleware({
          max: 15,
          windowSeconds: 5,
          useInMemory: false,
        }),
      )
      getHigh() {
        return 'Hello World';
      }

      @Get('/authenticated')
      @UseBefore(
        (req: Request, _res: Response, next: NextFunction) => {
          ctx.addData({ user: req.query.user as string });
          next();
        },
        await createRateLimitMiddleware({ max: 5, windowSeconds: 5, useInMemory: false }),
      )
      getAuthenticated() {
        return 'Hello World';
      }
    }

    http = new HTTP(
      {
        controllers: [TestController],
      },
      { port: undefined },
    );

    await http.start();
  });

  afterEach(async () => {
    await http.stop();

    const redis = await Redis.getClient('http:rateLimit');
    await redis.flushAll();
  });

  after(async () => {
    await Redis.destroy();
  });

  it('should limit requests', async () => {
    const agent = supertest(http.expressInstance);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    agent.get('/low-limit').set('X-Forwarded-For', '127.0.0.2');

    for (let i = 0; i < 4; i++) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await agent.get('/low-limit').expect(200);
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await agent.get('/low-limit').expect(429);
  });

  it('should apply distinct limits per user', async () => {
    const agent = supertest(http.expressInstance);

    for (let i = 0; i < 4; i++) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await agent.get('/authenticated?user=1').expect(200);
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await agent.get('/authenticated?user=1').expect(429);

    for (let i = 0; i < 4; i++) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await agent.get('/authenticated?user=2').expect(200);
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await agent.get('/authenticated?user=2').expect(429);
  });

  it('Should accurately report metadata info via HTTP headers', async () => {
    const agent = supertest(http.expressInstance);

    for (let i = 1; i < 5; i++) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const res = await agent.get('/low-limit').expect(200);
      expect(res.header['x-ratelimit-remaining']).to.equal((5 - i).toString());
      expect(res.header['x-ratelimit-limit']).to.equal('5');
      expect(res.header['x-ratelimit-reset']).to.be.a('string');
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const res = await agent.get('/low-limit').expect(429);
    expect(res.header['x-ratelimit-remaining']).to.equal('0');
    expect(res.header['x-ratelimit-limit']).to.equal('5');
  });
});
