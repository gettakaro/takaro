import { BuiltinModule } from '../../BuiltinModule.js';
import { Duration } from 'luxon';

export class Teleports extends BuiltinModule {
  constructor() {
    super(
      'teleports',
      'A set of commands to allow players to set their own teleport points and teleport to them.',
      JSON.stringify({
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        properties: {
          timeout: {
            title: 'Timeout',
            description: 'The time one has to wait before teleporting again.',
            'x-component': 'duration',
            type: 'number',
            minimum: 0,
            default: Duration.fromObject({ second: 1 }).as('milliseconds'),
          },
          allowPublicTeleports: {
            type: 'boolean',
            description: 'Players can create public teleports.',
            default: false,
          },
        },
        required: [],
        additionalProperties: false,
      }),
      JSON.stringify({
        timeout: { 'ui:widget': 'duration' },
      })
    );

    this.functions = [
      {
        name: 'utils',
        function: '',
      },
    ];

    this.permissions = [
      {
        permission: 'TELEPORTS_CREATE_PUBLIC',
        friendlyName: 'Create Public Teleports',
        description: 'Allows the player to create public teleports.',
        canHaveCount: true,
      },
      {
        permission: 'TELEPORTS_USE',
        friendlyName: 'Use Teleports',
        description: 'Allows the player to use teleports modules.',
        canHaveCount: true,
      },
      {
        permission: 'TELEPORTS_MANAGE_WAYPOINTS',
        friendlyName: 'Manage waypoints',
        description: 'Allows creating, deleting, and managing waypoints.',
        canHaveCount: false,
      },
    ];

    this.commands = [
      {
        function: '',
        name: 'teleport',
        trigger: 'tp',
        helpText: 'Teleports to one of your set locations.',
        arguments: [
          {
            name: 'tp',
            type: 'string',
            defaultValue: undefined,
            helpText: 'The location to teleport to.',
            position: 0,
          },
        ],
      },
      {
        function: '',
        name: 'tplist',
        trigger: 'tplist',
        helpText: 'Lists all your set locations.',
      },
      {
        function: '',
        name: 'settp',
        trigger: 'settp',
        helpText: 'Sets a location to teleport to.',
        arguments: [
          {
            name: 'tp',
            type: 'string',
            defaultValue: undefined,
            helpText: 'The location name.',
            position: 0,
          },
        ],
      },
      {
        function: '',
        name: 'deletetp',
        trigger: 'deletetp',
        helpText: 'Deletes a location.',
        arguments: [
          {
            name: 'tp',
            type: 'string',
            defaultValue: undefined,
            helpText: 'The location name.',
            position: 0,
          },
        ],
      },
      {
        function: '',
        name: 'setpublic',
        trigger: 'setpublic',
        helpText: 'Sets a teleport to be public, allowing other players to teleport to it.',
        arguments: [
          {
            name: 'tp',
            type: 'string',
            defaultValue: undefined,
            helpText: 'The location name.',
            position: 0,
          },
        ],
      },
      {
        function: '',
        name: 'setprivate',
        trigger: 'setprivate',
        helpText: 'Sets a teleport to be private, only the teleport owner can teleport to it.',
        arguments: [
          {
            name: 'tp',
            type: 'string',
            defaultValue: undefined,
            helpText: 'The location name.',
            position: 0,
          },
        ],
      },
      {
        function: '',
        name: 'setwaypoint',
        trigger: 'setwaypoint',
        helpText: 'Creates a new waypoint.',
        arguments: [
          {
            name: 'waypoint',
            type: 'string',
            defaultValue: undefined,
            helpText: 'The location name.',
            position: 0,
          },
        ],
      },
      {
        function: '',
        name: 'deletewaypoint',
        trigger: 'deletewaypoint',
        helpText: 'Deletes a waypoint.',
        arguments: [
          {
            name: 'waypoint',
            type: 'string',
            defaultValue: undefined,
            helpText: 'The location name.',
            position: 0,
          },
        ],
      },
      {
        function: '',
        name: 'listwaypoints',
        trigger: 'waypoints',
        helpText: 'Lists all waypoints.',
      },
      {
        function: '',
        name: 'teleportwaypoint',
        trigger: 'teleportwaypoint',
        helpText:
          'Placeholder command, this will not be used directly. The module will install aliases for this command corresponding to the waypoint names.',
      },
    ];
  }
}
