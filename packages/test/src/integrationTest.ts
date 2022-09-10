import { ITestWithSnapshot, matchSnapshot } from './snapshots';
import { Response } from 'supertest';
import supertest from 'supertest';
import { integrationConfig } from './main';
import { expect } from './test/expect';
import { logger } from '@takaro/logger';
import { faker } from '@faker-js/faker';

export class IntegrationTest {
  private domain: any = null;
  private rootUser: any = null;
  private rootPassword: string | null = null;
  private rootToken: string | null = null;
  private userToken: string | null = null;
  public response: Response | null = null;

  private createdDomains: any[] = [];

  public data: Record<string, unknown> = {};

  private log = logger('IntegrationTest');

  constructor(public test: ITestWithSnapshot) {
    this.test.expectedStatus = this.test.expectedStatus ?? 200;
    this.test.filteredFields = this.test.filteredFields ?? [];
  }

  get apiUtils() {
    return {
      createDomain: this.createDomain.bind(this),
      deleteDomain: this.deleteDomain.bind(this),
      createUser: this.createUser.bind(this),
      createRole: this.createRole.bind(this),
      createGameServer: this.createGameServer.bind(this),
      login: this.login.bind(this),
    };
  }

  run() {
    describe(this.test.name, () => {
      before(async () => {
        if (this.test.standardEnvironment) {
          this.domain = await this.createDomain();
          await this.login();
        }

        if (this.test.setup) {
          await this.test.setup.bind(this)();
        }
      });

      after(async () => {
        if (this.test.teardown) {
          await this.test.teardown.bind(this)();
        }

        try {
          await Promise.all(
            this.createdDomains.map((d) => this.deleteDomain(d.id))
          );
        } catch (error) {
          this.log.warn('Error deleting domains', error);
        }
      });

      it(this.test.name, async () => {
        const token = await this.login();

        const url =
          typeof this.test.url === 'function'
            ? this.test.url.bind(this)()
            : this.test.url;

        const req = supertest(integrationConfig.get('host'))[this.test.method](
          url
        );

        if (this.test.body) {
          req.send(this.test.body);
        }

        if (this.test.adminAuth) {
          req.auth('admin', integrationConfig.get('auth.adminSecret'));
        } else {
          req.set('Authorization', `Bearer ${token}`);
        }

        const response = await req;
        this.response = response;

        await matchSnapshot(
          { ...this.test, name: this.test.name, url },
          response
        );
        expect(response.statusCode).to.equal(this.test.expectedStatus);
      });
    });
  }

  private async createDomain(name = 'test-domain') {
    const res = await supertest(integrationConfig.get('host'))
      .post('/domain')
      .auth('admin', integrationConfig.get('auth.adminSecret'))
      .send({ name });

    this.rootUser = res.body.data.rootUser;
    this.rootPassword = res.body.data.password;
    this.createdDomains.push(res.body.data.domain);
    return res.body.data.domain;
  }

  private async deleteDomain(id?: string) {
    if (!id) {
      this.log.warn('No domain to delete, returning anyway');
      return;
    }

    await supertest(integrationConfig.get('host'))
      .delete(`/domain/${id}`)
      .expect(200)
      .auth('admin', integrationConfig.get('auth.adminSecret'));
  }

  private async login(capabilities: string[] | string = []) {
    if (!this.rootUser || !this.rootPassword) {
      throw new Error('No root user or password');
    }

    const rootLoginRes = await supertest(integrationConfig.get('host'))
      .post('/login')
      .set('Content-Type', 'application/json')
      .expect(200)
      .send({ username: this.rootUser.email, password: this.rootPassword });
    this.rootToken = rootLoginRes.body.data.token;

    if (
      capabilities &&
      (Array.isArray(capabilities) ? capabilities.length : capabilities)
    ) {
      const roleRes = await supertest(integrationConfig.get('host'))
        .post('/role')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${this.rootToken}`)
        .expect(200)
        .send({
          name: 'auto-test-role',
          capabilities: Array.isArray(capabilities)
            ? capabilities
            : [capabilities],
        });

      const password = faker.internet.password();
      const userRes = await supertest(integrationConfig.get('host'))
        .post('/user')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${this.rootToken}`)
        .expect(200)
        .send({
          name: faker.internet.userName(),
          email: faker.internet.email(),
          password,
        });

      await supertest(integrationConfig.get('host'))
        .post(`/user/${userRes.body.data.id}/role/${roleRes.body.data.id}`)
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${this.rootToken}`)
        .expect(200);

      const loginRes = await supertest(integrationConfig.get('host'))
        .post('/login')
        .set('Content-Type', 'application/json')
        .expect(200)
        .send({ username: userRes.body.data.email, password });

      this.userToken = loginRes.body.data.token;
    }

    return this.userToken ?? this.rootToken;
  }

  private async createUser(name = 'auto-test-user') {
    if (!this.domain) {
      throw new Error('No domain to create user in');
    }

    const res = await supertest(integrationConfig.get('host'))
      .post('/user')
      .set('Content-Type', 'application/json')
      .auth('admin', integrationConfig.get('auth.adminSecret'))
      .expect(200)
      .send({ name, domainId: this.domain.id });

    return res.body;
  }

  private async createRole(name = 'auto-test-role', capabilities = ['ROOT']) {
    if (!this.domain) {
      throw new Error('No domain to create record in');
    }

    if (!this.rootToken) {
      throw new Error('Not logged in yet');
    }

    const res = await supertest(integrationConfig.get('host'))
      .post('/role')
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${this.rootToken}`)
      .send({ name, capabilities });

    return res.body;
  }

  private async createGameServer(name = 'auto-test-gameServer') {
    if (!this.domain) {
      throw new Error('No domain to create record in');
    }

    if (!this.rootToken) {
      throw new Error('Not logged in yet');
    }

    const res = await supertest(integrationConfig.get('host'))
      .post('/gameserver')
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${this.rootToken}`)
      .send({ name, connectionInfo: { ip: '127.0.0.1', port: 1337 } });

    return res.body;
  }
}
