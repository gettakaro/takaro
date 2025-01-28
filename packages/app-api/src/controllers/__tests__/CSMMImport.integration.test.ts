import { IntegrationTest, expect } from '@takaro/test';
import { Client, ImportInputDTO } from '@takaro/apiclient';
import { readFile } from 'fs/promises';
import { join } from 'path';
import * as url from 'url';
import { GAME_SERVER_TYPE } from '@takaro/gameserver';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const group = 'CSMMImport';

async function doImport(client: Client, importData: string, options: ImportInputDTO) {
  const formData = new FormData();
  formData.append('import', importData);
  formData.append('options', JSON.stringify(options));

  // API client doesn't play nicely with file uploads, so we drop down to axios directly
  const res = await client.axiosInstance.post('/gameServer/import', formData);

  const jobId = res.data.data.id;

  // Poll for completion
  let jobStatus = null;
  while (jobStatus === null || jobStatus === 'pending') {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    jobStatus = (await client.gameserver.gameServerControllerGetImport(jobId)).data.data.status;
  }
}

const tests = [
  new IntegrationTest({
    snapshot: false,
    group,
    name: 'Full import',
    test: async function () {
      const importFile = await readFile(join(__dirname, 'data', 'csmm-export-full.json'), 'utf8');
      const options: ImportInputDTO = {
        currency: true,
        roles: true,
        players: true,
        shop: true,
      };

      await doImport(this.client, importFile, options);

      const gameserver = (await this.client.gameserver.gameServerControllerSearch()).data.data[0];
      expect(gameserver).to.have.property('name', 'CSMM Import Test Server');

      const roles = (await this.client.role.roleControllerSearch()).data.data;
      expect(roles).to.have.length(6);

      const players = (await this.client.player.playerControllerSearch()).data.data;
      expect(players).to.have.length(7);

      /*       const listings = (await this.client.shopListing.shopListingControllerSearch()).data.data;
            expect(listings).to.have.length(4);
            expect(listings[0]).to.have.property('quality', null); */
    },
  }),
  new IntegrationTest({
    snapshot: false,
    group,
    name: 'Import without roles',
    test: async function () {
      const importFile = await readFile(join(__dirname, 'data', 'csmm-export-full.json'), 'utf8');
      const options: ImportInputDTO = {
        currency: true,
        roles: false,
        players: true,
        shop: true,
      };

      await doImport(this.client, importFile, options);

      const gameserver = (await this.client.gameserver.gameServerControllerSearch()).data.data[0];
      expect(gameserver).to.have.property('name', 'CSMM Import Test Server');

      const roles = (await this.client.role.roleControllerSearch()).data.data;
      expect(roles).to.have.length(5);

      const players = (await this.client.player.playerControllerSearch()).data.data;
      expect(players).to.have.length(7);
    },
  }),
  new IntegrationTest({
    snapshot: false,
    group,
    name: 'Import without players',
    test: async function () {
      const importFile = await readFile(join(__dirname, 'data', 'csmm-export-full.json'), 'utf8');
      const options: ImportInputDTO = {
        currency: true,
        roles: true,
        players: false,
        shop: true,
      };

      await doImport(this.client, importFile, options);

      const gameserver = (await this.client.gameserver.gameServerControllerSearch()).data.data[0];
      expect(gameserver).to.have.property('name', 'CSMM Import Test Server');

      const roles = (await this.client.role.roleControllerSearch()).data.data;
      expect(roles).to.have.length(6);

      const players = (await this.client.player.playerControllerSearch()).data.data;
      expect(players).to.have.length(0);
    },
  }),
  new IntegrationTest({
    snapshot: false,
    group,
    name: 'Import existing server skips server creation but allows other data to be imported',
    test: async function () {
      const importFile = await readFile(join(__dirname, 'data', 'csmm-export-full.json'), 'utf8');

      const createdServer = (
        await this.client.gameserver.gameServerControllerCreate({
          name: 'CSMM Import Test Server',
          type: GAME_SERVER_TYPE.SEVENDAYSTODIE,
          connectionInfo: JSON.stringify({
            host: '127.0.0.1',
            adminUser: 'admin',
            adminToken: 'password',
            useTls: false,
          }),
        })
      ).data.data;

      const options: ImportInputDTO = {
        currency: true,
        roles: true,
        players: true,
        shop: true,
      };

      await doImport(this.client, importFile, options);

      const gameserver = (await this.client.gameserver.gameServerControllerSearch()).data.data[0];
      expect(gameserver).to.have.property('id', createdServer.id);

      const roles = (await this.client.role.roleControllerSearch()).data.data;
      expect(roles).to.have.length(6);

      const players = (await this.client.player.playerControllerSearch()).data.data;
      expect(players).to.have.length(7);
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
