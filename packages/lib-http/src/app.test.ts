import { HTTP } from './app';
import supertest from 'supertest';
import { expect } from '@takaro/test';

describe('app', () => {
  let http: HTTP;
  before(async () => {
    http = new HTTP({}, { port: undefined });
    await http.start();
  });

  after(async () => {
    await http.stop();
  });

  it('Serves a health status', async () => {
    const response = await supertest(http.expressInstance).get('/healthz');
    expect(response.status).to.be.equal(200);
  });
});
