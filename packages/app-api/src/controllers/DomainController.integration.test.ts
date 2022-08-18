import supertest from 'supertest';
import { expect, integrationConfig } from '@takaro/test';

describe('Domain controller', () => {
  it('GET /domain', async () => {
    const response = await supertest(integrationConfig.get('host'))
      .get('/domain')
      .auth('admin', integrationConfig.get('auth.adminSecret'));
    expect(response.status).to.equal(200);
  });

  it('POST /domain', async () => {
    const response = await supertest(integrationConfig.get('host'))
      .post('/domain')
      .auth('admin', integrationConfig.get('auth.adminSecret'))
      .send({ name: 'testName' });
    expect(response.status).to.equal(200);
    expect(response.body.data).to.have.property('id');
    expect(response.body.data).to.have.property('name', 'testName');
  });
});
