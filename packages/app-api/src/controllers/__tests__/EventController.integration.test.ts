import { IntegrationTest, expect, SetupGameServerPlayers } from '@takaro/test';
import { EventCreateDTO, EventSearchInputDTO, IHookEventTypeEnum } from '@takaro/apiclient';
import { describe } from 'node:test';
import { isAxiosError } from 'axios';

const group = 'EventController';

const tests = [
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'Export events to CSV with basic data',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      // Create some test events
      const events: EventCreateDTO[] = [
        {
          eventName: IHookEventTypeEnum.PlayerConnected,
          gameserverId: this.setupData.gameServer1.id,
          playerId: this.setupData.players[0].id,
          meta: { connectionInfo: { ip: '127.0.0.1' } },
        },
        {
          eventName: IHookEventTypeEnum.ChatMessage,
          gameserverId: this.setupData.gameServer1.id,
          playerId: this.setupData.players[1].id,
          meta: { message: 'Hello, world!', channel: 'global' },
        },
      ];

      for (const event of events) {
        await this.client.event.eventControllerCreate(event);
      }

      // Export events
      const query: EventSearchInputDTO = {
        filters: { gameserverId: [this.setupData.gameServer1.id] },
        extend: ['gameServer', 'player'],
      };

      const response = await this.client.axiosInstance.post('/event/export', query, {
        responseType: 'text',
      });

      expect(response.status).to.equal(200);
      expect(response.headers['content-type']).to.equal('text/csv');
      expect(response.headers['content-disposition']).to.match(/filename="events_\d{4}-\d{2}-\d{2}\.csv"/);

      // Parse CSV to verify content
      const csvLines = response.data.split('\n');
      expect(csvLines.length).to.be.greaterThan(2); // Header + at least 2 events

      // Check headers include entity names
      const headers = csvLines[0].split(',');
      expect(headers).to.include('"playerName"');
      expect(headers).to.include('"gameserverName"');
      expect(headers).to.include('"meta.connectionInfo.ip"');
      expect(headers).to.include('"meta.message"');
    },
  }),

  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'Export events with 90-day validation',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      const now = new Date();
      const past91Days = new Date(now.getTime() - 91 * 24 * 60 * 60 * 1000);

      const query: EventSearchInputDTO = {
        greaterThan: { createdAt: past91Days.toISOString() },
        lessThan: { createdAt: now.toISOString() },
      };

      try {
        await this.client.axiosInstance.post('/event/export', query, {
          responseType: 'text',
        });
        expect.fail('Should have thrown validation error');
      } catch (error) {
        if (!isAxiosError(error)) throw error;
        if (!error.response) throw error;
        expect(error.response.status).to.equal(400);

        // Parse the response data since it's returned as string due to responseType: 'text'
        const responseData =
          typeof error.response.data === 'string' ? JSON.parse(error.response.data) : error.response.data;

        expect(responseData.meta.error.message).to.include('90 days');
      }
    },
  }),

  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'Export empty CSV when no events match',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      const oneYearAgo = new Date(new Date().getTime() - 365 * 24 * 60 * 60 * 1000); // 1 year ago
      const OneYearAgoPlusOneDay = new Date(oneYearAgo.getTime() + 24 * 60 * 60 * 1000); // 1 year + 1 day
      const query: EventSearchInputDTO = {
        greaterThan: { createdAt: oneYearAgo.toISOString() },
        lessThan: { createdAt: OneYearAgoPlusOneDay.toISOString() },
      };

      const response = await this.client.axiosInstance.post('/event/export', query, {
        responseType: 'text',
      });

      expect(response.status).to.equal(200);

      const csvLines = response.data.split('\n').filter((line: string) => line.trim());
      expect(csvLines.length).to.equal(2); // Header + message row
      expect(csvLines[1]).to.include('No events found');
    },
  }),

  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'Export with special characters in data',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      // Create event with special characters
      await this.client.event.eventControllerCreate({
        eventName: IHookEventTypeEnum.ChatMessage,
        gameserverId: this.setupData.gameServer1.id,
        playerId: this.setupData.players[0].id,
        meta: {
          message: 'Test "quotes", commas, and\nnewlines',
          channel: 'global',
        },
      });

      const query: EventSearchInputDTO = {
        filters: {
          eventName: [IHookEventTypeEnum.ChatMessage],
          gameserverId: [this.setupData.gameServer1.id],
        },
      };

      const response = await this.client.axiosInstance.post('/event/export', query, {
        responseType: 'text',
      });

      expect(response.status).to.equal(200);

      // Verify CSV properly escapes special characters
      expect(response.data).to.include('"Test ""quotes"", commas, and\nnewlines"');
    },
  }),

  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'Export performance with moderate dataset',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      // Create 1000 test events
      const batchSize = 100;
      const totalEvents = 1000;

      for (let i = 0; i < totalEvents / batchSize; i++) {
        const batch = Array.from({ length: batchSize }).map((_, j) => ({
          eventName: IHookEventTypeEnum.PlayerConnected,
          gameserverId: this.setupData.gameServer1.id,
          playerId: this.setupData.players[j % this.setupData.players.length].id,
          meta: {
            connectionId: i * batchSize + j,
            timestamp: new Date().toISOString(),
            data: { index: i * batchSize + j },
          },
        }));

        await Promise.all(batch.map((event) => this.client.event.eventControllerCreate(event)));
      }

      const startTime = Date.now();

      const query: EventSearchInputDTO = {
        filters: { gameserverId: [this.setupData.gameServer1.id] },
      };

      const response = await this.client.axiosInstance.post('/event/export', query, {
        responseType: 'text',
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(response.status).to.equal(200);
      expect(duration).to.be.lessThan(10000); // Should complete within 10 seconds

      // Verify we got all events
      const csvLines = response.data.split('\n').filter((line: string) => line.trim());
      expect(csvLines.length).to.be.greaterThanOrEqual(totalEvents); // At least header + all events
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
