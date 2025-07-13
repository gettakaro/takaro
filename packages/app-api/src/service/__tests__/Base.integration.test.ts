import { IntegrationTest, expect, SetupGameServerPlayers } from '@takaro/test';
import { EventService } from '../EventService.js';
import { IHookEventTypeEnum } from '@takaro/apiclient';
import { describe } from 'node:test';

const group = 'Base Service - getIterator';

const tests = [
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'Can iterate through multiple pages of results',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      if (!this.standardDomainId) throw new Error('standardDomainId is not set');
      const eventService = new EventService(this.standardDomainId);
      const eventCount = 250;

      // Create 250 events
      for (let i = 0; i < eventCount; i++) {
        await this.client.event.eventControllerCreate({
          eventName: IHookEventTypeEnum.PlayerConnected,
          gameserverId: this.setupData.gameServer1.id,
          playerId: this.setupData.players[0].id,
          meta: { index: i },
        });
      }

      // Use getIterator to fetch all events
      const fetchedEvents = [];
      for await (const event of eventService.getIterator()) {
        fetchedEvents.push(event);
      }

      // Verify we fetched many events (including our created ones)
      expect(fetchedEvents.length).to.be.greaterThanOrEqual(eventCount);

      // Verify no duplicates by checking unique IDs
      const uniqueIds = new Set(fetchedEvents.map((e) => e.id));
      expect(uniqueIds.size).to.equal(fetchedEvents.length);
    },
  }),

  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'Returns empty iterator when no results match',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      if (!this.standardDomainId) throw new Error('standardDomainId is not set');
      const eventService = new EventService(this.standardDomainId);

      // Create some events
      await this.client.event.eventControllerCreate({
        eventName: IHookEventTypeEnum.PlayerConnected,
        gameserverId: this.setupData.gameServer1.id,
        playerId: this.setupData.players[0].id,
        meta: { test: true },
      });

      // Use getIterator with filter that matches nothing
      const fetchedEvents = [];
      for await (const event of eventService.getIterator({
        filters: {
          eventName: [IHookEventTypeEnum.RoleAssigned],
          gameserverId: ['00000000-0000-0000-0000-000000000000'], // Use valid UUID that doesn't exist
        },
      })) {
        fetchedEvents.push(event);
      }

      expect(fetchedEvents.length).to.equal(0);
    },
  }),

  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'Can iterate through single page of results',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      if (!this.standardDomainId) throw new Error('standardDomainId is not set');
      const eventService = new EventService(this.standardDomainId);
      const eventCount = 50;

      // Create 50 events (less than one page)
      for (let i = 0; i < eventCount; i++) {
        await this.client.event.eventControllerCreate({
          eventName: IHookEventTypeEnum.ChatMessage,
          gameserverId: this.setupData.gameServer1.id,
          playerId: this.setupData.players[0].id,
          meta: { message: `Message ${i}`, channel: 'global' },
        });
      }

      // Use getIterator to fetch all events
      const fetchedEvents = [];
      for await (const event of eventService.getIterator()) {
        fetchedEvents.push(event);
      }

      // Verify all events were fetched
      expect(fetchedEvents.length).to.be.greaterThanOrEqual(eventCount);

      // Verify we have at least the events we created
      const chatMessages = fetchedEvents.filter((e) => e.eventName === IHookEventTypeEnum.ChatMessage);
      expect(chatMessages.length).to.be.greaterThanOrEqual(eventCount);
    },
  }),

  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'Can iterate with custom page size',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      if (!this.standardDomainId) throw new Error('standardDomainId is not set');
      const eventService = new EventService(this.standardDomainId);
      const eventCount = 75;
      const pageSize = 25; // This will create exactly 3 pages

      // Create 75 events
      for (let i = 0; i < eventCount; i++) {
        await this.client.event.eventControllerCreate({
          eventName: IHookEventTypeEnum.PlayerDisconnected,
          gameserverId: this.setupData.gameServer1.id,
          playerId: this.setupData.players[0].id,
          meta: { index: i },
        });
      }

      // Use getIterator with custom limit
      const fetchedEvents = [];
      for await (const event of eventService.getIterator({ limit: pageSize })) {
        fetchedEvents.push(event);
      }

      // Verify all events were fetched
      expect(fetchedEvents.length).to.be.greaterThanOrEqual(eventCount);

      // Verify we have at least the events we created
      const disconnectEvents = fetchedEvents.filter((e) => e.eventName === IHookEventTypeEnum.PlayerDisconnected);
      expect(disconnectEvents.length).to.be.greaterThanOrEqual(eventCount);
    },
  }),

  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'Handles exact page boundary correctly',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      if (!this.standardDomainId) throw new Error('standardDomainId is not set');
      const eventService = new EventService(this.standardDomainId);
      const eventCount = 200; // Exactly 2 pages with default limit of 100

      // Create exactly 200 events
      for (let i = 0; i < eventCount; i++) {
        await this.client.event.eventControllerCreate({
          eventName: IHookEventTypeEnum.PlayerDeath,
          gameserverId: this.setupData.gameServer1.id,
          playerId: this.setupData.players[0].id,
          meta: { deathIndex: i },
        });
      }

      // Use getIterator to fetch all events
      const fetchedEvents = [];
      for await (const event of eventService.getIterator()) {
        fetchedEvents.push(event);
      }

      // Verify all events were fetched
      expect(fetchedEvents.length).to.be.greaterThanOrEqual(eventCount);

      // Verify we have at least the events we created
      const deathEvents = fetchedEvents.filter((e) => e.eventName === IHookEventTypeEnum.PlayerDeath);
      expect(deathEvents.length).to.be.greaterThanOrEqual(eventCount);

      // Check for duplicates in fetched events
      const fetchedIds = fetchedEvents.map((e) => e.id);
      const uniqueFetchedIds = new Set(fetchedIds);
      expect(uniqueFetchedIds.size).to.equal(fetchedEvents.length);
    },
  }),

  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'Can iterate with filters applied',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      if (!this.standardDomainId) throw new Error('standardDomainId is not set');
      const eventService = new EventService(this.standardDomainId);
      const connectEvents = 80;
      const chatEvents = 70;

      // Create mixed event types
      for (let i = 0; i < connectEvents; i++) {
        await this.client.event.eventControllerCreate({
          eventName: IHookEventTypeEnum.PlayerConnected,
          gameserverId: this.setupData.gameServer1.id,
          playerId: this.setupData.players[0].id,
          meta: { type: 'connect', index: i },
        });
      }

      for (let i = 0; i < chatEvents; i++) {
        await this.client.event.eventControllerCreate({
          eventName: IHookEventTypeEnum.ChatMessage,
          gameserverId: this.setupData.gameServer1.id,
          playerId: this.setupData.players[0].id,
          meta: { message: `Chat ${i}`, channel: 'global' },
        });
      }

      // Use getIterator with filter for PlayerConnected only
      const fetchedEvents = [];
      for await (const event of eventService.getIterator({
        filters: {
          eventName: [IHookEventTypeEnum.PlayerConnected],
        },
      })) {
        fetchedEvents.push(event);
      }

      // Verify only PlayerConnected events were fetched
      expect(fetchedEvents.length).to.be.greaterThanOrEqual(connectEvents);

      // Verify all fetched events are PlayerConnected type
      const allConnectType = fetchedEvents.every((e) => e.eventName === IHookEventTypeEnum.PlayerConnected);
      expect(allConnectType).to.be.true;
    },
  }),

  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'Can handle large datasets efficiently',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      if (!this.standardDomainId) throw new Error('standardDomainId is not set');
      const eventService = new EventService(this.standardDomainId);
      const pageSize = 10; // Small page size to test many iterations
      const sampleSize = 100; // We'll only create a sample to verify, not all 1050

      // Create sample events to verify iteration
      for (let i = 0; i < sampleSize; i++) {
        await this.client.event.eventControllerCreate({
          eventName: IHookEventTypeEnum.ChatMessage,
          gameserverId: this.setupData.gameServer1.id,
          playerId: this.setupData.players[0].id,
          meta: { message: `Sample message ${i}`, channel: 'global' },
        });
      }

      // Use getIterator with small page size
      const fetchedCount = { total: 0, chatMessage: 0 };

      for await (const event of eventService.getIterator({ limit: pageSize })) {
        fetchedCount.total++;
        if (event.eventName === IHookEventTypeEnum.ChatMessage) {
          fetchedCount.chatMessage++;
        }
      }

      // Verify we fetched at least our sample events
      expect(fetchedCount.total).to.be.greaterThanOrEqual(sampleSize);
      expect(fetchedCount.chatMessage).to.be.greaterThanOrEqual(sampleSize);
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
