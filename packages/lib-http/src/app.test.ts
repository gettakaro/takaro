import { HTTP } from './app';
import supertest from 'supertest';
import { expect } from '@takaro/test';
import { config } from './config';

describe('app', () => {
  let http: HTTP;
  before(async () => {
    config.load({ http: { port: undefined } });
    http = new HTTP();
    await http.start();
  });

  after(async () => {
    await http.stop();
  });

  it('Serves a health status', async () => {
    const response = await supertest(http.expressInstance).get('/health');
    expect(response.status).to.be.equal(200);
  });
});
