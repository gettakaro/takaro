import { IntegrationTest, expect } from '@takaro/test';
import { isAxiosError, ModuleOutputDTO } from '@takaro/apiclient';

const group = 'ModuleController';

const testPermission = { permission: 'test', description: 'test', friendlyName: 'test' };

const tests = [
  new IntegrationTest<ModuleOutputDTO>({
    group,
    snapshot: true,
    name: 'Get by ID',
    setup: async function () {
      return (
        await this.client.module.moduleControllerCreate({
          name: 'Test module',
        })
      ).data.data;
    },
    test: async function () {
      return this.client.module.moduleControllerGetOne(this.setupData.id);
    },
  }),
  new IntegrationTest<void>({
    group,
    snapshot: true,
    name: 'Create',
    test: async function () {
      return this.client.module.moduleControllerCreate({
        name: 'Test module',
      });
    },
  }),
  new IntegrationTest<ModuleOutputDTO>({
    group,
    snapshot: true,
    name: 'Update',
    setup: async function () {
      return (
        await this.client.module.moduleControllerCreate({
          name: 'Test module',
          description: 'bla bla',
        })
      ).data.data;
    },
    test: async function () {
      return this.client.module.moduleControllerUpdate(this.setupData.id, {
        name: 'Updated module',
        description: 'Updated description',
      });
    },
  }),
  new IntegrationTest<ModuleOutputDTO>({
    group,
    snapshot: true,
    name: 'Delete',
    setup: async function () {
      return (
        await this.client.module.moduleControllerCreate({
          name: 'Test module',
        })
      ).data.data;
    },
    test: async function () {
      return this.client.module.moduleControllerRemove(this.setupData.id);
    },
  }),
  new IntegrationTest<ModuleOutputDTO>({
    group,
    snapshot: true,
    name: 'Does not allow updating built-in modules',
    setup: async function () {
      const utilsModule = (
        await this.client.module.moduleControllerSearch({
          filters: {
            name: ['utils'],
          },
        })
      ).data.data[0];
      if (!utilsModule) {
        throw new Error('Utils module not found');
      }

      return utilsModule;
    },
    test: async function () {
      let res;
      try {
        res = await this.client.module.moduleControllerUpdate(this.setupData.id, {
          name: 'Updated module',
          description: 'Updated description',
        });
        throw new Error('Should have errored');
      } catch (error) {
        if (!isAxiosError(error)) {
          throw error;
        } else {
          res = error.response;
          expect(error.response?.status).to.equal(400);
          expect(error.response?.data.meta.error.code).to.equal('BadRequestError');
          expect(error.response?.data.meta.error.message).to.equal('Cannot modify builtin modules');
        }
      }

      return res;
    },
    expectedStatus: 400,
  }),
  new IntegrationTest<ModuleOutputDTO>({
    group,
    snapshot: true,
    name: 'Does not allow deleting built-in modules',
    setup: async function () {
      const utilsModule = (
        await this.client.module.moduleControllerSearch({
          filters: {
            name: ['utils'],
          },
        })
      ).data.data[0];
      if (!utilsModule) {
        throw new Error('Utils module not found');
      }

      return utilsModule;
    },
    test: async function () {
      let res;
      try {
        res = await this.client.module.moduleControllerRemove(this.setupData.id);
        throw new Error('Should have errored');
      } catch (error) {
        if (!isAxiosError(error)) {
          throw error;
        } else {
          res = error.response;
          expect(error.response?.status).to.equal(400);
          expect(error.response?.data.meta.error.code).to.equal('BadRequestError');
          expect(error.response?.data.meta.error.message).to.equal('Cannot modify builtin modules');
        }
      }

      return res;
    },
    expectedStatus: 400,
  }),
  new IntegrationTest({
    group,
    snapshot: true,
    name: 'Does not allow creating modules with "builtin" parameter set',
    test: async function () {
      let res;
      try {
        res = await this.client.module.moduleControllerCreate({
          name: 'Test module',
          // @ts-expect-error Our types don't allow this but we still need to test runtime validation...
          builtin: 'test',
        });
        throw new Error('Should have errored');
      } catch (error) {
        if (!isAxiosError(error)) {
          throw error;
        } else {
          res = error.response;
          expect(error.response?.status).to.equal(400);
          expect(error.response?.data.meta.error.code).to.equal('ValidationError');
          expect(error.response?.data.meta.error.details[0].constraints.whitelistValidation).to.equal(
            'property builtin should not exist'
          );
        }
      }

      return res;
    },
    expectedStatus: 400,
  }),
  new IntegrationTest({
    group,
    snapshot: true,
    name: 'Allows passing an array of permissions when creating a module',
    test: async function () {
      return this.client.module.moduleControllerCreate({
        name: 'Test module',
        permissions: [testPermission],
      });
    },
    filteredFields: ['moduleId'],
  }),
  new IntegrationTest<ModuleOutputDTO>({
    group,
    snapshot: true,
    name: 'Allows passing an array of permissions when updating a module',
    setup: async function () {
      return (
        await this.client.module.moduleControllerCreate({
          name: 'Test module',
        })
      ).data.data;
    },
    test: async function () {
      return this.client.module.moduleControllerUpdate(this.setupData.id, {
        permissions: [testPermission],
      });
    },
    filteredFields: ['moduleId'],
  }),
  new IntegrationTest<ModuleOutputDTO>({
    group,
    snapshot: true,
    name: 'Updating permissions keeps IDs static of already-existing permissions',
    setup: async function () {
      return (
        await this.client.module.moduleControllerCreate({
          name: 'Test module',
          permissions: [testPermission],
        })
      ).data.data;
    },
    test: async function () {
      const secondPermission = { permission: 'test2', description: 'test2', friendlyName: 'test2' };
      const updateRes = await this.client.module.moduleControllerUpdate(this.setupData.id, {
        permissions: [testPermission, secondPermission],
      });

      const newPermission = updateRes.data.data.permissions.find((p) => p.permission === 'test');
      const existingPermission = this.setupData.permissions.find((p) => p.permission === 'test');

      if (!existingPermission || !newPermission) {
        throw new Error('Permission not found');
      }

      expect(existingPermission.id).to.equal(newPermission.id);

      return updateRes;
    },
    filteredFields: ['moduleId'],
  }),
  new IntegrationTest<ModuleOutputDTO>({
    group,
    snapshot: true,
    name: 'Updating permissions can remove permissions',
    setup: async function () {
      return (
        await this.client.module.moduleControllerCreate({
          name: 'Test module',
          permissions: [testPermission],
        })
      ).data.data;
    },
    test: async function () {
      await this.client.module.moduleControllerUpdate(this.setupData.id, {
        permissions: [],
      });

      const getRes = await this.client.module.moduleControllerGetOne(this.setupData.id);

      expect(getRes.data.data.permissions).to.have.length(0);

      return getRes;
    },
    filteredFields: ['moduleId'],
  }),
  new IntegrationTest<ModuleOutputDTO>({
    group,
    snapshot: true,
    name: 'Updating permission returns updated permission',
    setup: async function () {
      return (
        await this.client.module.moduleControllerCreate({
          name: 'Test module',
          permissions: [testPermission],
        })
      ).data.data;
    },
    test: async function () {
      await this.client.module.moduleControllerUpdate(this.setupData.id, {
        permissions: [
          {
            permission: testPermission.permission,
            description: 'new description',
            friendlyName: 'new friendly name',
            canHaveCount: false,
          },
        ],
      });

      const getRes = await this.client.module.moduleControllerGetOne(this.setupData.id);

      expect(getRes.data.data.permissions).to.have.length(1);
      expect(getRes.data.data.permissions[0].permission).to.equal(testPermission.permission);
      expect(getRes.data.data.permissions[0].description).to.equal('new description');
      expect(getRes.data.data.permissions[0].friendlyName).to.equal('new friendly name');
      expect(getRes.data.data.permissions[0].canHaveCount).to.equal(false);

      return getRes;
    },
    filteredFields: ['moduleId'],
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
