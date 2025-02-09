import { IntegrationTest, expect } from '@takaro/test';
import { isAxiosError, ModuleOutputDTO } from '@takaro/apiclient';
import { getModules } from '@takaro/modules';
import { describe } from 'node:test';

const group = 'ModuleController';

const testPermission = { permission: 'test', description: 'test', friendlyName: 'test' };

const setup = async function (this: IntegrationTest<ModuleOutputDTO>) {
  return (
    await this.client.module.moduleControllerCreate({
      name: 'Test module',
    })
  ).data.data;
};

const tests = [
  // #region CRUD
  new IntegrationTest<ModuleOutputDTO>({
    group,
    snapshot: true,
    name: 'Get by ID',
    setup,
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
    setup,
    filteredFields: ['moduleId'],
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
    setup,
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
  // #endregion CRUD
  // #region Permissions
  new IntegrationTest({
    group,
    snapshot: true,
    name: 'Allows passing an array of permissions when creating a module',
    test: async function () {
      return this.client.module.moduleControllerCreate({
        name: 'Test module',
        latestVersion: {
          permissions: [testPermission],
        },
      });
    },
    filteredFields: ['moduleId', 'moduleVersionId'],
  }),
  new IntegrationTest<ModuleOutputDTO>({
    group,
    snapshot: true,
    name: 'Allows passing an array of permissions when updating a module',
    setup,
    test: async function () {
      await this.client.module.moduleControllerUpdate(this.setupData.id, {
        latestVersion: {
          permissions: [testPermission],
        },
      });

      return this.client.module.moduleVersionControllerGetModuleVersion(this.setupData.latestVersion.id);
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
          latestVersion: {
            permissions: [testPermission],
          },
        })
      ).data.data;
    },
    test: async function () {
      const secondPermission = { permission: 'test2', description: 'test2', friendlyName: 'test2' };
      await this.client.module.moduleControllerUpdate(this.setupData.id, {
        latestVersion: {
          permissions: [testPermission, secondPermission],
        },
      });

      const versionRes = await this.client.module.moduleVersionControllerGetModuleVersion(
        this.setupData.latestVersion.id,
      );

      const newPermission = versionRes.data.data.permissions.find((p) => p.permission === 'test');
      const existingPermission = this.setupData.latestVersion.permissions.find((p) => p.permission === 'test');

      if (!existingPermission || !newPermission) {
        throw new Error('Permission not found');
      }

      expect(existingPermission.id).to.equal(newPermission.id);

      return versionRes;
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
          latestVersion: {
            permissions: [testPermission],
          },
        })
      ).data.data;
    },
    test: async function () {
      await this.client.module.moduleControllerUpdate(this.setupData.id, {
        latestVersion: { permissions: [] },
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
          latestVersion: {
            permissions: [testPermission],
          },
        })
      ).data.data;
    },
    test: async function () {
      await this.client.module.moduleControllerUpdate(this.setupData.id, {
        latestVersion: {
          permissions: [
            {
              permission: testPermission.permission,
              description: 'new description',
              friendlyName: 'new friendly name',
              canHaveCount: false,
            },
          ],
        },
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
  // #endregion Permissions
  // #region Import/export
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
          const exportRes = await this.client.module.moduleControllerExport(mod.id);
          expect(exportRes.data.data.name).to.be.equal(builtin.name);

          const expectedTags = builtin.versions.map((v) => v.tag);
          for (const tag of expectedTags) {
            const version = exportRes.data.data.versions.find((v) => v.tag === tag);
            // Check that each builtin version is present in the exported module
            expect(version).to.exist;
            // Typescipt doesn't understand that `expect` already checks for existence
            if (!version) throw new Error(`Version ${tag} not found in exported module`);
            // Each version should contain hooks,commands,cronjobs,...
            expect(version.hooks).to.exist;
            expect(version.commands).to.exist;
            expect(version.cronJobs).to.exist;
            expect(version.functions).to.exist;
            expect(version.permissions).to.exist;
          }
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
          const exportRes = await this.client.module.moduleControllerExport(mods[0].id);
          await this.client.module.moduleControllerImport(exportRes.data.data);
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
  new IntegrationTest<ModuleOutputDTO>({
    group,
    snapshot: false,
    name: 'Can select which versions to export',
    setup,
    test: async function () {
      // Create a module, tag 2 versions, export only one
      const tagRes = await this.client.module.moduleVersionControllerTagVersion({
        moduleId: this.setupData.id,
        tag: '1.0.0',
      });
      await this.client.module.moduleVersionControllerTagVersion({
        moduleId: this.setupData.id,
        tag: '2.0.0',
      });

      const exportRes = await this.client.module.moduleControllerExport(this.setupData.id, {
        versionIds: [tagRes.data.data.id],
      });

      expect(exportRes.data.data.versions).to.have.length(1);
      expect(exportRes.data.data.versions[0].tag).to.equal('1.0.0');
    },
  }),
  // #endregion Import/export
  // #region Versioning
  new IntegrationTest<ModuleOutputDTO>({
    group,
    snapshot: true,
    name: 'versioning: Can tag a version',
    setup,
    filteredFields: ['moduleId'],
    test: async function () {
      const tagRes = await this.client.module.moduleVersionControllerTagVersion({
        moduleId: this.setupData.id,
        tag: '1.0.0',
      });

      expect(tagRes.data.data.tag).to.equal('1.0.0');
      return tagRes;
    },
  }),
  new IntegrationTest<ModuleOutputDTO>({
    group,
    snapshot: true,
    name: 'versioning: Tag a version with non-semver tag -> error',
    setup,
    test: async function () {
      let res;
      try {
        res = await this.client.module.moduleVersionControllerTagVersion({
          moduleId: this.setupData.id,
          tag: 'not-semver',
        });
        throw new Error('Should have errored');
      } catch (error) {
        if (!isAxiosError(error)) {
          throw error;
        } else {
          res = error.response;
          expect(error.response?.status).to.equal(400);
          expect(error.response?.data.meta.error.code).to.equal('BadRequestError');
          expect(error.response?.data.meta.error.message).to.equal(
            'Invalid version tag, please use semver. Eg 1.0.0 or 2.0.4',
          );
        }
      }

      return res;
    },
    expectedStatus: 400,
  }),
  new IntegrationTest<ModuleOutputDTO>({
    group,
    snapshot: false,
    name: 'versioning: Cannot edit tagged versions',
    setup,
    test: async function () {
      const tagRes = await this.client.module.moduleVersionControllerTagVersion({
        moduleId: this.setupData.id,
        tag: '1.0.0',
      });

      expect(tagRes.data.data.tag).to.equal('1.0.0');

      try {
        await this.client.hook.hookControllerCreate({
          versionId: tagRes.data.data.id,
          name: 'test',
          eventType: 'player-connected',
          regex: '.*',
        });
        throw new Error('Should have errored');
      } catch (error) {
        if (!isAxiosError(error)) {
          throw error;
        } else {
          expect(error.response?.status).to.equal(400);
          expect(error.response?.data.meta.error.code).to.equal('BadRequestError');
          expect(error.response?.data.meta.error.message).to.equal(
            'Cannot modify a tagged version of a module, edit the "latest" version instead',
          );
        }
      }
    },
  }),
  // #endregion Versioning
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
