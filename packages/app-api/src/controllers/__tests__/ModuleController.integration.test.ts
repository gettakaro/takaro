import { IntegrationTest, expect } from '@takaro/test';
import { isAxiosError, ModuleOutputDTO } from '@takaro/apiclient';
import { getModules } from '@takaro/modules';

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
    filteredFields: ['moduleId'],
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
    filteredFields: ['moduleId'],
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
    name: 'Does not allow creating modules with builtin parameter set',
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
            'property builtin should not exist',
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
    filteredFields: ['moduleId', 'moduleVersionId'],
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
      return this.client.module.moduleVersionControllerUpdateVersion(this.setupData.latestVersion.id, {
        permissions: [testPermission],
      });
    },
    filteredFields: ['moduleId', 'moduleVersionId'],
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
      const updateRes = await this.client.module.moduleVersionControllerUpdateVersion(this.setupData.latestVersion.id, {
        permissions: [testPermission, secondPermission],
      });

      const newPermission = updateRes.data.data.permissions.find((p) => p.permission === 'test');
      const existingPermission = this.setupData.latestVersion.permissions.find((p) => p.permission === 'test');

      if (!existingPermission || !newPermission) {
        throw new Error('Permission not found');
      }

      expect(existingPermission.id).to.equal(newPermission.id);

      return updateRes;
    },
    filteredFields: ['moduleId', 'moduleVersionId'],
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
      await this.client.module.moduleVersionControllerUpdateVersion(this.setupData.latestVersion.id, {
        permissions: [],
      });

      const getRes = await this.client.module.moduleControllerGetOne(this.setupData.id);

      expect(getRes.data.data.latestVersion.permissions).to.have.length(0);

      return getRes;
    },
    filteredFields: ['moduleId', 'moduleVersionId'],
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
      await this.client.module.moduleVersionControllerUpdateVersion(this.setupData.latestVersion.id, {
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

      expect(getRes.data.data.latestVersion.permissions).to.have.length(1);
      expect(getRes.data.data.latestVersion.permissions[0].permission).to.equal(testPermission.permission);
      expect(getRes.data.data.latestVersion.permissions[0].description).to.equal('new description');
      expect(getRes.data.data.latestVersion.permissions[0].friendlyName).to.equal('new friendly name');
      expect(getRes.data.data.latestVersion.permissions[0].canHaveCount).to.equal(false);

      return getRes;
    },
    filteredFields: ['moduleId', 'moduleVersionId'],
  }),
  ...getModules().map(
    (builtin) =>
      new IntegrationTest<ModuleOutputDTO>({
        group,
        snapshot: false,
        name: `Can export builtin module ${builtin.name}`,
        test: async function () {
          const mod = (
            await this.client.module.moduleControllerSearch({
              filters: {
                name: [builtin.name],
              },
            })
          ).data.data[0];
          const versions = (
            await this.client.module.moduleVersionControllerSearchVersions({
              filters: { moduleId: [mod.id], version: [builtin.version] },
            })
          ).data.data;
          const version = versions.find((v) => v.tag === builtin.version);
          if (!version) throw new Error('Version not found');
          const exportRes = await this.client.module.moduleVersionControllerExport({ versionId: version.id });
          expect(exportRes.data.data).to.deep.equalInAnyOrder(builtin);
        },
      }),
  ),
  ...getModules().map(
    (builtin) =>
      new IntegrationTest<ModuleOutputDTO>({
        group,
        snapshot: false,
        name: `Can import the exported builtin module ${builtin.name}`,
        test: async function () {
          const mods = (
            await this.client.module.moduleControllerSearch({
              filters: {
                name: [builtin.name, `${builtin.name}-imported`],
              },
            })
          ).data.data;
          expect(mods).to.have.length(1);
          const exportRes = await this.client.module.moduleVersionControllerExport({
            versionId: mods[0].latestVersion.id,
          });
          await this.client.module.moduleVersionControllerImport(exportRes.data.data);
          const modsAfter = (
            await this.client.module.moduleControllerSearch({
              filters: {
                name: [builtin.name, `${builtin.name}-imported`],
              },
            })
          ).data.data;
          expect(modsAfter).to.have.length(2);
        },
      }),
  ),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
