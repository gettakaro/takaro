import { expect, sandbox } from '@takaro/test';
import supertest from 'supertest';
import { HTTP } from '../app';
import { config } from '../config';
import { Route } from './Route';

describe('Route handler', () => {
  before(async () => {
    config.load({ http: { port: undefined } });
  });
  it('Can handle a basic request', async () => {
    const spy = sandbox.spy();
    const route = new Route({
      handler: (req, res) => {
        spy();
        res.sendStatus(200);
      },
      method: 'get',
      path: '/test',
    });

    const app = new HTTP([route]);

    const response = await supertest(app.expressInstance).get('/test');
    expect(response.status).to.be.equal(200);
    expect(spy).to.have.been.calledOnce;
  });
});
