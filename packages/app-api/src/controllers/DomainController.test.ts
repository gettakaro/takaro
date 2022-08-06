import supertest from 'supertest';
import { expect } from '@takaro/test';
import { HTTP } from '@takaro/http';
import { DomainController } from './DomainController';

describe('Domain controller', () => {
  let server: HTTP;
  before(async () => {
    server = new HTTP({ controllers: [DomainController] }, { port: undefined });
    await server.start();
  });

  after(async () => {
    await server.stop();
  });

  it('GET /domain', async () => {
    const response = await supertest(server.expressInstance).get('/domain');
    expect(response.status).to.equal(200);
  });

  it('POST /domain', async () => {
    const response = await supertest(server.expressInstance)
      .post('/domain')
      .send({ name: 'testName' });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('id');
    expect(response.body).to.have.property('name', 'testName');
  });
});
