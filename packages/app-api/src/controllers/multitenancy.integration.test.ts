import { Domain, Role, User } from '@prisma/client';
import { DANGEROUS_cleanDatabase } from '@takaro/db';
import { expect, integrationConfig } from '@takaro/test';
import supertest from 'supertest';

async function setupEnv() {
  const domain1 = await supertest(integrationConfig.get('host'))
    .post('/domain')
    .auth('admin', integrationConfig.get('auth.adminSecret'))
    .send({ name: 'domain1' });
  const rootLogin1 = await supertest(integrationConfig.get('host'))
    .post('/login')
    .set('Content-Type', 'application/json')
    .expect(200)
    .send({
      username: domain1.body.data.rootUser.email,
      password: domain1.body.data.password,
    });

  const domain2 = await supertest(integrationConfig.get('host'))
    .post('/domain')
    .auth('admin', integrationConfig.get('auth.adminSecret'))
    .send({ name: 'domain2' });
  const rootLogin2 = await supertest(integrationConfig.get('host'))
    .post('/login')
    .set('Content-Type', 'application/json')
    .expect(200)
    .send({
      username: domain2.body.data.rootUser.email,
      password: domain2.body.data.password,
    });

  return {
    rootToken1: rootLogin1.body.data.token,
    rootToken2: rootLogin2.body.data.token,
    domain1: domain1.body.data,
    domain2: domain2.body.data,
  };
}

// TODO: Expand this test to something more generic that covers more ground maybe?
// Currently do not want to invest time into this but it will be good to have in the future
// Perhaps when there is an openapi spec of the API so we can generate this test?
describe('Multitenancy', () => {
  let session: {
    rootToken1: string;
    rootToken2: string;
    domain1: {
      domain: Domain;
      rootUser: User;
      rootRole: Role;
      password: string;
    };
    domain2: {
      domain: Domain;
      rootUser: User;
      rootRole: Role;
      password: string;
    };
  };

  beforeEach(async () => {
    session = await setupEnv();
  });

  afterEach(async () => {
    await DANGEROUS_cleanDatabase();
  });

  it('Does not leak items from a different domain', async () => {
    const res = await supertest(integrationConfig.get('host'))
      .get('/user')
      .set('Authorization', `Bearer ${session.rootToken1}`)
      .expect(200);

    expect(res.body.data).to.have.length(1);
    expect(res.body.data[0].id).to.equal(session.domain1.rootUser.id);

    const res2 = await supertest(integrationConfig.get('host'))
      .get('/user')
      .set('Authorization', `Bearer ${session.rootToken2}`)
      .expect(200);

    expect(res2.body.data).to.have.length(1);
    expect(res2.body.data[0].id).to.equal(session.domain2.rootUser.id);
  });
});
