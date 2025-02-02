import { HTTP } from '../../app.js';
import supertest from 'supertest';
import { describe, it } from 'node:test';

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
    await supertest(http.expressInstance).get('/healthz').expect(200);
  });

  it('Serves a open api spec', async () => {
    await supertest(http.expressInstance).get('/openapi.json').expect(200);
  });
});
