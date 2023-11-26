import { BuiltinModule } from '../../BuiltinModule.js';
import { EventTypes } from '../../main.js';

export class Bounty extends BuiltinModule {
  constructor() {
    super(
      'bounty',
      'A set of commands for setting bounties on players',
      JSON.stringify({
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        properties: {},
        required: [],
        additionalProperties: false,
      })
    );

    this.hooks = [
      {
        // TODO: set correct event type
        eventType: EventTypes.PLAYER_CONNECTED,
        name: 'resolveBounty',
        function: '',
      },
    ];

    this.commands = [
      {
        function: '',
        name: 'bounty',
        trigger: 'bounty',
        helpText: 'Set a bounty on a player',
        arguments: [
          {
            name: 'target',
            type: 'player',
            helpText: 'The player to set the bounty on',
            position: 0,
          },
          {
            name: 'amount',
            type: 'number',
            helpText: 'The amount of currency to set the bounty to',
            position: 1,
          },
        ],
      },
      {
        function: '',
        name: 'deleteBounty',
        trigger: 'deletebounty',
        helpText: 'Delete a bounty on a player',
        arguments: [
          {
            name: 'target',
            type: 'player',
            helpText: 'The player to delete the bounty on',
            position: 0,
          },
        ],
      },
      {
        function: '',
        name: 'listBounties',
        trigger: 'listbounteis',
        helpText: 'List the top 10 bounties (if available)',
      },

      {
        function: '',
        name: 'getbounty',
        trigger: 'getbounty',
        helpText: 'Get the bounty on a player',
        arguments: [
          {
            name: 'target',
            type: 'player',
            helpText: 'Gives the bounty amount on a player (if any)',
            position: 0,
          },
        ],
      },
    ];
  }
}
