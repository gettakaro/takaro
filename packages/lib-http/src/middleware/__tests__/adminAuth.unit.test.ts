import { HTTP } from '../../app.js';
import supertest from 'supertest';
import { expect } from '@takaro/test';
import { createAdminAuthMiddleware } from '../adminAuth.js';
import { ErrorHandler } from '../errorHandler.js';
import { Request, Response } from 'express';

describe('adminAuth', () => {
  let http: HTTP;
  before(async () => {
    http = new HTTP({}, { port: undefined });
    http.expressInstance.use(
      '/test',
      createAdminAuthMiddleware('test-password'),
      (req: Request, res: Response) => {
        res.json({ ok: true });
      },
      ErrorHandler
    );
    await http.start();
  });

  after(async () => {
    await http.stop();
  });

  it('Rejects requests with no credentials', async () => {
    const response = await supertest(http.expressInstance).get('/test');
    expect(response.status).to.be.equal(401);
  });

  it('Rejects requests with invalid credentials', async () => {
    const response = await supertest(http.expressInstance)
      .get('/test')
      .auth('admin', 'invalid-password');
    expect(response.status).to.be.equal(401);
  });

  it('Accepts requests with valid credentials', async () => {
    const response = await supertest(http.expressInstance)
      .get('/test')
      .auth('admin', 'test-password');
    expect(response.status).to.be.equal(200);
  });
});
