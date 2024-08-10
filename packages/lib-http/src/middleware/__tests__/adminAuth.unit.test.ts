import { HTTP } from '../../app.js';
import supertest from 'supertest';
import { expect } from '@takaro/test';
import { ory } from '@takaro/auth';
import { AdminClient } from '@takaro/apiclient';
import { adminAuthMiddleware } from '../adminAuth.js';
import { ErrorHandler } from '../errorHandler.js';
import { Request, Response } from 'express';

describe('adminAuth', () => {
  let http: HTTP;
  before(async () => {
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

  after(async () => {
    await http.stop();
  });

  it('Rejects requests with no credentials', async () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const response = await supertest(http.expressInstance).get('/test');
    expect(response.status).to.be.equal(401);
  });

  it('Rejects requests with invalid credentials', async () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const response = await supertest(http.expressInstance).get('/test').set('Authorization', 'Bearer foobar');
    expect(response.status).to.be.equal(403);
  });

  it('Accepts requests with valid credentials', async () => {
    const { clientId, clientSecret } = await ory.createOIDCClient();

    const adminClient = new AdminClient({
      url: 'http://localhost:3000',
      auth: {
        clientId,
        clientSecret,
      },
      OAuth2URL: ory.OAuth2URL,
    });

    const token = await adminClient.getOidcToken();

    const response = await supertest(http.expressInstance)
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      .get('/test')
      .set('Authorization', `Bearer ${token.access_token}`);

    expect(response.status).to.be.equal(200);
  });
});
