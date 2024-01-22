import ms from 'ms';
import { BuiltinModule } from '../../BuiltinModule.js';
import { HookEvents } from '../../dto/index.js';

export class GeoBlock extends BuiltinModule {
  constructor() {
    super(
      'geoBlock',
      'Block players from certain countries from joining the server.',
      JSON.stringify({
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        properties: {
          mode: {
            type: 'string',
            description:
              'If set to allow, only players from the specified countries will be allowed to join. If set to deny, players from the specified countries will be banned from the server. ',
            enum: ['allow', 'deny'],
            default: 'deny',
          },
          countries: {
            type: 'array',
            items: {
              type: 'string',
            },
            description: 'List of country codes.',
          },
          ban: {
            type: 'boolean',
            description:
              'Ban players from the server when they are detected. When false, players will be kicked instead.',
            default: true,
          },
          banDuration: {
            type: 'number',
            description: 'Number of seconds to ban players for.',
            default: ms('1year') / 1000,
          },
          message: {
            type: 'string',
            description: 'Message to send to the player when they are kicked or banned.',
            default: 'Your IP address is banned.',
          },
        },
        required: [],
        additionalProperties: false,
      })
    );

    this.permissions = [
      {
        permission: 'GEOBLOCK_IMMUNITY',
        friendlyName: 'GeoBlock immunity',
        description: 'Players with this permission will not be kicked or banned by GeoBlock.',
      },
    ];

    this.commands = [];
    this.hooks = [
      {
        eventType: HookEvents.PLAYER_NEW_IP_DETECTED,
        name: 'IPDetected',
        function: '',
      },
    ];
  }
}
