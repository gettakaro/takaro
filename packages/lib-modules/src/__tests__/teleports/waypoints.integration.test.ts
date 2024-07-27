import { IntegrationTest, expect, integrationConfig } from '@takaro/test';
import { IModuleTestsSetupData, modulesTestSetup } from '@takaro/test';
import { GameEvents } from '../../dto/index.js';
import { GameServerTypesOutputDTOTypeEnum, PlayerOutputDTO, RoleOutputDTO } from '@takaro/apiclient';

const group = 'Teleports - waypoints';

interface WaypointsSetup extends IModuleTestsSetupData {
  playerRole: RoleOutputDTO;
  manageWaypointsRole: RoleOutputDTO;
  player: PlayerOutputDTO;
  moderator: PlayerOutputDTO;
}

const waypointsSetup = async function (this: IntegrationTest<WaypointsSetup>): Promise<WaypointsSetup> {
  const setupData = await modulesTestSetup.bind(this as unknown as IntegrationTest<IModuleTestsSetupData>)();

  await this.client.gameserver.gameServerControllerInstallModule(setupData.gameserver.id, setupData.teleportsModule.id);

  const playersRes = await this.client.player.playerControllerSearch();

  await Promise.all(
    playersRes.data.data.map(async (player) => {
      await this.client.player.playerControllerRemoveRole(player.id, setupData.role.id);
    }),
  );

  const manageWaypointsPermission = await this.client.permissionCodesToInputs(['TELEPORTS_MANAGE_WAYPOINTS']);
  const manageWaypointsRole = (
    await this.client.role.roleControllerCreate({
      name: 'ManageWaypoints',
      permissions: manageWaypointsPermission,
    })
  ).data.data;

  const playerRole = (await this.client.role.roleControllerSearch({ filters: { name: ['Player'] } })).data.data[0];

  const player = setupData.players[0];
  const moderator = setupData.players[1];

  await this.client.player.playerControllerAssignRole(moderator.id, manageWaypointsRole.id);

  return {
    ...setupData,
    manageWaypointsRole: manageWaypointsRole,
    player,
    moderator,
    playerRole,
  };
};

async function setupSecondServer() {
  const newGameServer = await this.client.gameserver.gameServerControllerCreate({
    name: 'newServer',
    connectionInfo: JSON.stringify({
      host: integrationConfig.get('mockGameserver.host'),
      name: 'newServer',
    }),
    type: GameServerTypesOutputDTOTypeEnum.Mock,
  });

  await this.client.gameserver.gameServerControllerInstallModule(
    newGameServer.data.data.id,
    this.setupData.teleportsModule.id,
  );

  const connectedEvents = this.setupData.eventAwaiter.waitForEvents(GameEvents.PLAYER_CONNECTED, 5);

  await this.client.gameserver.gameServerControllerExecuteCommand(newGameServer.data.data.id, {
    command: 'connectAll',
  });

  await connectedEvents;

  const newServerPlayers = (
    await this.client.playerOnGameserver.playerOnGameServerControllerSearch({
      filters: { gameServerId: [newGameServer.data.data.id] },
    })
  ).data.data;
  const newServerModerator = newServerPlayers[0];
  const newServerPlayer = newServerPlayers[1];

  await this.client.player.playerControllerAssignRole(
    newServerModerator.playerId,
    this.setupData.manageWaypointsRole.id,
  );

  return {
    newGameServer,
    newServerModerator,
    newServerPlayer,
  };
}

const tests = [
  new IntegrationTest<WaypointsSetup>({
    group,
    snapshot: false,
    setup: waypointsSetup,
    name: 'Can create a waypoint with /setwaypoint',
    test: async function () {
      const events = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/setwaypoint A',
        playerId: this.setupData.moderator.id,
      });

      expect((await events).length).to.be.eq(1);
      expect((await events)[0].data.msg).to.be.eq('Waypoint A set.');
    },
  }),
  new IntegrationTest<WaypointsSetup>({
    group,
    snapshot: false,
    setup: waypointsSetup,
    name: 'Errors when creating duplicate waypoints',
    test: async function () {
      const firstEvents = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/setwaypoint A',
        playerId: this.setupData.moderator.id,
      });

      expect((await firstEvents).length).to.be.eq(1);
      expect((await firstEvents)[0].data.msg).to.be.eq('Waypoint A set.');

      const secondEvents = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/setwaypoint A',
        playerId: this.setupData.moderator.id,
      });

      expect((await secondEvents).length).to.be.eq(1);
      expect((await secondEvents)[0].data.msg).to.be.eq('Waypoint A already exists.');
    },
  }),
  new IntegrationTest<WaypointsSetup>({
    group,
    snapshot: false,
    setup: waypointsSetup,
    name: '/setwaypoint requires TELEPORTS_MANAGE_WAYPOINTS permission',
    test: async function () {
      const firstEvents = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/setwaypoint A',
        playerId: this.setupData.player.id,
      });

      expect((await firstEvents).length).to.be.eq(1);
      expect((await firstEvents)[0].data.msg).to.be.eq('You do not have permission to manage waypoints.');

      await this.client.player.playerControllerAssignRole(
        this.setupData.player.id,
        this.setupData.manageWaypointsRole.id,
      );

      const secondEvents = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/setwaypoint A',
        playerId: this.setupData.moderator.id,
      });

      expect((await secondEvents).length).to.be.eq(1);
      expect((await secondEvents)[0].data.msg).to.be.eq('Waypoint A set.');
    },
  }),
  new IntegrationTest<WaypointsSetup>({
    group,
    snapshot: false,
    setup: waypointsSetup,
    name: 'Can delete a waypoint with /deletewaypoint',
    test: async function () {
      const events = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/setwaypoint A',
        playerId: this.setupData.moderator.id,
      });

      expect((await events).length).to.be.eq(1);
      expect((await events)[0].data.msg).to.be.eq('Waypoint A set.');

      const teleportEvents = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE);

      const useWaypointPermission = await this.client.permissionCodesToInputs([
        `WAYPOINTS_USE_A_${this.setupData.gameserver.id}`,
      ]);
      await this.client.role.roleControllerUpdate(this.setupData.playerRole.id, {
        permissions: useWaypointPermission,
      });

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/A',
        playerId: this.setupData.player.id,
      });

      expect((await teleportEvents).length).to.be.eq(1);
      expect((await teleportEvents)[0].data.msg).to.be.eq('Teleported to waypoint A.');

      const deleteEvents = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/deletewaypoint A',
        playerId: this.setupData.moderator.id,
      });

      expect((await deleteEvents).length).to.be.eq(1);
      expect((await deleteEvents)[0].data.msg).to.be.eq('Waypoint A deleted.');
    },
  }),
  new IntegrationTest<WaypointsSetup>({
    group,
    snapshot: false,
    setup: waypointsSetup,
    name: 'Errors when trying to delete a waypoint that does not exist',
    test: async function () {
      const events = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/deletewaypoint A',
        playerId: this.setupData.moderator.id,
      });

      expect((await events).length).to.be.eq(1);
      // eslint-disable-next-line quotes
      expect((await events)[0].data.msg).to.be.eq("Waypoint A doesn't exist.");
    },
  }),
  new IntegrationTest<WaypointsSetup>({
    group,
    snapshot: false,
    setup: waypointsSetup,
    name: '/deletewaypoint requires TELEPORTS_MANAGE_WAYPOINTS permission',
    test: async function () {
      // First set waypoint
      // Then try to delete as player -> error
      // Then try to delete as moderator -> success

      const firstEvents = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/setwaypoint A',
        playerId: this.setupData.moderator.id,
      });

      expect((await firstEvents).length).to.be.eq(1);
      expect((await firstEvents)[0].data.msg).to.be.eq('Waypoint A set.');

      const secondEvents = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/deletewaypoint A',
        playerId: this.setupData.player.id,
      });

      expect((await secondEvents).length).to.be.eq(1);
      expect((await secondEvents)[0].data.msg).to.be.eq('You do not have permission to manage waypoints.');

      const thirdEvents = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/deletewaypoint A',
        playerId: this.setupData.moderator.id,
      });

      expect((await thirdEvents).length).to.be.eq(1);
      expect((await thirdEvents)[0].data.msg).to.be.eq('Waypoint A deleted.');
    },
  }),
  new IntegrationTest<WaypointsSetup>({
    group,
    snapshot: false,
    setup: waypointsSetup,
    name: 'Can list waypoints (and shows only waypoints you have permission for)',
    test: async function () {
      // Create waypoint A & B
      // Give players access to both
      // /waypoints -> shows A & B
      // Remove access to B
      // /waypoints -> shows only A

      const setEvents = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 2);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/setwaypoint A',
        playerId: this.setupData.moderator.id,
      });

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/setwaypoint B',
        playerId: this.setupData.moderator.id,
      });

      expect((await setEvents).length).to.be.eq(2);
      expect((await setEvents)[0].data.msg).to.be.eq('Waypoint A set.');
      expect((await setEvents)[1].data.msg).to.be.eq('Waypoint B set.');

      const useWaypointAPermission = await this.client.permissionCodesToInputs([
        `WAYPOINTS_USE_A_${this.setupData.gameserver.id}`,
      ]);
      const useWaypointBPermission = await this.client.permissionCodesToInputs([
        `WAYPOINTS_USE_B_${this.setupData.gameserver.id}`,
      ]);

      await this.client.role.roleControllerUpdate(this.setupData.playerRole.id, {
        permissions: [...useWaypointAPermission, ...useWaypointBPermission],
      });

      const listEvents = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/waypoints',
        playerId: this.setupData.player.id,
      });

      expect((await listEvents).length).to.be.eq(1);
      expect((await listEvents)[0].data.msg).to.be.eq('Available waypoints: A, B');

      await this.client.role.roleControllerUpdate(this.setupData.playerRole.id, {
        permissions: useWaypointAPermission,
      });

      const listEvents2 = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/waypoints',
        playerId: this.setupData.player.id,
      });

      expect((await listEvents2).length).to.be.eq(1);
      expect((await listEvents2)[0].data.msg).to.be.eq('Available waypoints: A');
    },
  }),
  new IntegrationTest<WaypointsSetup>({
    group,
    snapshot: false,
    setup: waypointsSetup,
    name: 'Has a user friendly message when listing waypoints and there are none',
    test: async function () {
      const listEvents = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/waypoints',
        playerId: this.setupData.player.id,
      });

      expect((await listEvents).length).to.be.eq(1);
      expect((await listEvents)[0].data.msg).to.be.eq('There are no waypoints available.');
    },
  }),
  new IntegrationTest<WaypointsSetup>({
    group,
    snapshot: false,
    setup: waypointsSetup,
    name: 'Players can teleport to a waypoint',
    test: async function () {
      const events = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE);
      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/setwaypoint trader',
        playerId: this.setupData.moderator.id,
      });
      expect((await events).length).to.be.eq(1);
      expect((await events)[0].data.msg).to.be.eq('Waypoint trader set.');

      const useWaypointPermission = await this.client.permissionCodesToInputs([
        `WAYPOINTS_USE_TRADER_${this.setupData.gameserver.id}`,
      ]);
      await this.client.role.roleControllerUpdate(this.setupData.playerRole.id, {
        permissions: useWaypointPermission,
      });

      const teleportEvents = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE);
      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/trader',
        playerId: this.setupData.player.id,
      });
      expect((await teleportEvents).length).to.be.eq(1);
      expect((await teleportEvents)[0].data.msg).to.be.eq('Teleported to waypoint trader.');
    },
  }),
  new IntegrationTest<WaypointsSetup>({
    group,
    snapshot: false,
    setup: waypointsSetup,
    name: 'Can set multiple waypoints and teleport to them',
    test: async function () {
      const setEvents = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 2);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/setwaypoint A',
        playerId: this.setupData.moderator.id,
      });

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/setwaypoint B',
        playerId: this.setupData.moderator.id,
      });

      expect((await setEvents).length).to.be.eq(2);
      expect((await setEvents)[0].data.msg).to.be.eq('Waypoint A set.');
      expect((await setEvents)[1].data.msg).to.be.eq('Waypoint B set.');

      const useWaypointPermission = await this.client.permissionCodesToInputs([
        `WAYPOINTS_USE_A_${this.setupData.gameserver.id}`,
        `WAYPOINTS_USE_B_${this.setupData.gameserver.id}`,
      ]);
      await this.client.role.roleControllerUpdate(this.setupData.playerRole.id, {
        permissions: useWaypointPermission,
      });

      const teleportAEvents = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/A',
        playerId: this.setupData.player.id,
      });

      expect((await teleportAEvents).length).to.be.eq(1);
      expect((await teleportAEvents)[0].data.msg).to.be.eq('Teleported to waypoint A.');

      const teleportBEvents = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/B',
        playerId: this.setupData.player.id,
      });

      expect((await teleportBEvents).length).to.be.eq(1);
      expect((await teleportBEvents)[0].data.msg).to.be.eq('Teleported to waypoint B.');
    },
  }),
  new IntegrationTest<WaypointsSetup>({
    group,
    snapshot: false,
    setup: waypointsSetup,
    name: 'Can control who can use which waypoints using permissions (Player can use waypoint A but not waypoint B)',
    test: async function () {
      // Create 2 waypoints A and B
      // Give player permission to use A
      // Player uses A -> success
      // Player uses B -> error

      const setEvents = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 2);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/setwaypoint A',
        playerId: this.setupData.moderator.id,
      });

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/setwaypoint B',
        playerId: this.setupData.moderator.id,
      });

      expect((await setEvents).length).to.be.eq(2);
      expect((await setEvents)[0].data.msg).to.be.eq('Waypoint A set.');
      expect((await setEvents)[1].data.msg).to.be.eq('Waypoint B set.');

      const useWaypointPermission = await this.client.permissionCodesToInputs([
        `WAYPOINTS_USE_A_${this.setupData.gameserver.id}`,
      ]);
      await this.client.role.roleControllerUpdate(this.setupData.playerRole.id, {
        permissions: useWaypointPermission,
      });

      const teleportAEvents = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/A',
        playerId: this.setupData.player.id,
      });

      expect((await teleportAEvents).length).to.be.eq(1);
      expect((await teleportAEvents)[0].data.msg).to.be.eq('Teleported to waypoint A.');

      const teleportBEvents = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/B',
        playerId: this.setupData.player.id,
      });

      expect((await teleportBEvents).length).to.be.eq(1);
      expect((await teleportBEvents)[0].data.msg).to.be.eq('You are not allowed to use the waypoint B.');
    },
  }),
  new IntegrationTest<WaypointsSetup>({
    group,
    snapshot: false,
    setup: waypointsSetup,
    name: 'Cannot use a waypoint from a different gameserver',
    test: async function () {
      // Add a new gameserver first
      // Create a waypoint on the new gameserver
      // Try to use the waypoint from the new gameserver -> success
      // Try to use the waypoint from the original gameserver -> "waypoint does not exist"
      const { newGameServer, newServerModerator, newServerPlayer } = await setupSecondServer.bind(this)();

      // Make a waypoint on the new gameserver
      const setEvents = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE);
      await this.client.command.commandControllerTrigger(newGameServer.data.data.id, {
        msg: '/setwaypoint A',
        playerId: newServerModerator.playerId,
      });
      expect((await setEvents).length).to.be.eq(1);
      expect((await setEvents)[0].data.msg).to.be.eq('Waypoint A set.');

      // Make a waypoint on the original gameserver
      const setEvents2 = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE);
      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/setwaypoint notused',
        playerId: this.setupData.moderator.id,
      });
      expect((await setEvents2).length).to.be.eq(1);
      expect((await setEvents2)[0].data.msg).to.be.eq('Waypoint notused set.');

      const useWaypointPermission = await this.client.permissionCodesToInputs([
        `WAYPOINTS_USE_A_${newGameServer.data.data.id}`,
      ]);
      await this.client.role.roleControllerUpdate(this.setupData.playerRole.id, {
        permissions: useWaypointPermission,
      });

      // Use the waypoint from the new gameserver -> success
      const teleportEvents = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 1);
      await this.client.command.commandControllerTrigger(newGameServer.data.data.id, {
        msg: '/A',
        playerId: newServerPlayer.playerId,
      });
      expect((await teleportEvents).length).to.be.eq(1);
      expect((await teleportEvents)[0].data.msg).to.be.eq('Teleported to waypoint A.');

      // Use the waypoint from the original gameserver -> "waypoint does not exist"
      const teleportEvents2 = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE);
      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/A',
        playerId: this.setupData.player.id,
      });
      expect((await teleportEvents2).length).to.be.eq(1);
      expect((await teleportEvents2)[0].data.msg).to.be.eq('You are not allowed to use the waypoint A.');
    },
  }),
  new IntegrationTest<WaypointsSetup>({
    group,
    snapshot: false,
    setup: waypointsSetup,
    name: 'Creating waypoint with same name on 2 different gameservers does not conflict',
    test: async function () {
      // Create new gameserver
      // Create waypoint A on original gameserver
      // Create waypoint A on new gameserver
      // Allow player to use waypoint A on original gameserver but not new gameserver
      // Player uses A on original gameserver -> success
      // Player uses A on new gameserver -> error

      const { newGameServer, newServerModerator, newServerPlayer } = await setupSecondServer.bind(this)();

      // Make a waypoint on the original gameserver
      const setEvents = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE);
      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/setwaypoint A',
        playerId: this.setupData.moderator.id,
      });
      expect((await setEvents)[0].data.msg).to.be.eq('Waypoint A set.');

      // Make a waypoint on the new gameserver
      const setEvents2 = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE);
      await this.client.command.commandControllerTrigger(newGameServer.data.data.id, {
        msg: '/setwaypoint A',
        playerId: newServerModerator.playerId,
      });
      expect((await setEvents2)[0].data.msg).to.be.eq('Waypoint A set.');

      const useWaypointPermission = await this.client.permissionCodesToInputs([
        `WAYPOINTS_USE_A_${this.setupData.gameserver.id}`,
      ]);
      await this.client.role.roleControllerUpdate(this.setupData.playerRole.id, {
        permissions: useWaypointPermission,
      });

      // Use the waypoint from the original gameserver -> success
      const teleportEvents = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 1, {
        gameServerId: this.setupData.gameserver.id,
      });
      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/A',
        playerId: this.setupData.player.id,
      });
      expect((await teleportEvents)[0].data.msg).to.be.eq('Teleported to waypoint A.');

      // Use the waypoint from the new gameserver -> error
      const teleportEvents2 = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 1, {
        gameServerId: newGameServer.data.data.id,
      });
      await this.client.command.commandControllerTrigger(newGameServer.data.data.id, {
        msg: '/A',
        playerId: newServerPlayer.playerId,
      });
      expect((await teleportEvents2)[0].data.msg).to.be.eq('You are not allowed to use the waypoint A.');
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
