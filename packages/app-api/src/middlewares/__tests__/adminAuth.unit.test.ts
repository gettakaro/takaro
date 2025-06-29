import { ErrorHandler, HTTP } from '@takaro/http';
import supertest from 'supertest';
import { expect } from '@takaro/test';
import { adminAuthMiddleware } from '../adminAuth.js';
import { Request, Response } from 'express';
import { config } from '../../config.js';
import { describe, beforeAll, afterAll, it } from 'vitest';

describe('adminAuth', () => {
  let http: HTTP;
  beforeAll(async () => {
    http = new HTTP({}, { port: undefined });
    http.expressInstance.use(
      '/test',
      adminAuthMiddleware,
      (_req: Request, res: Response) => {
        res.json({ ok: true });
      },
      ErrorHandler,
    );
    await http.start();
  });

  afterAll(async () => {
    await http.stop();
  });

  it('Rejects requests with no credentials', async () => {
    await supertest(http.expressInstance).get('/test').expect(401);
  });

  it('Accepts requests with valid credentials', async () => {
    const response = await supertest(http.expressInstance)
      .get('/test')
      // @ts-expect-error Supertest typings are wrong
      .set('X-Takaro-Admin-Token', config.get('adminClientSecret'));

    expect(response.status).to.be.equal(200);
  });

  it('Rejects requests with invalid credentials', async () => {
    const response = await supertest(http.expressInstance)
      .get('/test')
      // @ts-expect-error Supertest typings are wrong
      .set('X-Takaro-Admin-Token', 'foobar');
    expect(response.status).to.be.equal(403);
  });
});
