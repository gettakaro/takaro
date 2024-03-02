import { HTTP } from '../../app.js';
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
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const response = await supertest(http.expressInstance).get('/healthz');
    expect(response.status).to.be.equal(200);
  });

  it('Serves a open api spec', async () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const response = await supertest(http.expressInstance).get('/openapi.json');
    expect(response.status).to.be.equal(200);
  });
});
