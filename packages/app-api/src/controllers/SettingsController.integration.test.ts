import { IntegrationTest, expect } from '@takaro/test';
const group = 'SettingsController';

const tests = [
  new IntegrationTest<void>({
    group,
    snapshot: true,
    name: 'Get a value',
    test: async function () {
      const res = await this.client.settings.settingsControllerGetOne(
        'commandPrefix'
      );
      expect(res.data.data).to.be.eq('/');
      return res;
    },
  }),
  new IntegrationTest<void>({
    group,
    snapshot: true,
    name: 'Set a value',
    test: async function () {
      await this.client.settings.settingsControllerSet('commandPrefix', {
        value: '!',
      });
      const res = await this.client.settings.settingsControllerGetOne(
        'commandPrefix'
      );
      expect(res.data.data).to.be.eq('!');
      return res;
    },
  }),
  new IntegrationTest<void>({
    group,
    snapshot: true,
    name: 'Get a value with invalid key',
    test: async function () {
      const res = await this.client.settings.settingsControllerGetOne(
        'invalidKey'
      );
      expect(res.data.data).to.be.eq(undefined);
      return res;
    },
    expectedStatus: 400,
  }),
  new IntegrationTest<void>({
    group,
    snapshot: true,
    name: 'Set a value with invalid key',
    test: async function () {
      const res = await this.client.settings.settingsControllerSet(
        'invalidKey',
        {
          value: '!',
        }
      );
      return res;
    },
    expectedStatus: 400,
  }),
  new IntegrationTest<void>({
    group,
    snapshot: true,
    name: 'Can get all settings',
    test: async function () {
      const res = await this.client.settings.settingsControllerGet();
      return res;
    },
  }),
  new IntegrationTest<void>({
    group,
    snapshot: true,
    name: 'Can get all settings with a filter',
    test: async function () {
      const res = await this.client.settings.settingsControllerGet([
        'commandPrefix',
      ]);
      return res;
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
