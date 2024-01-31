import { BuiltinModule } from '../../BuiltinModule.js';

export class Lottery extends BuiltinModule {
  constructor() {
    super(
      'lottery',
      'Players can buy tickets for a lottery, and the winner is chosen at random.',
      JSON.stringify({
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        properties: {
          profitMargin: {
            type: 'number',
            maximum: 1,
            minimum: 0,
            description: 'The profit margin the server takes from the lottery.',
            default: 0.1,
          },
        },
        required: [],
        additionalProperties: false,
      })
    );

    this.permissions = [
      {
        permission: 'LOTTERY_BUY',
        friendlyName: 'Buy Lottery Tickets',
        canHaveCount: true,
        description: 'Allows the player to buy lottery tickets.',
      },
      {
        permission: 'LOTTERY_VIEW_TICKETS',
        friendlyName: 'View Lottery Tickets',
        description: 'Allows the player to view his lottery tickets.',
      },
    ];

    this.cronJobs = [
      {
        name: 'drawLottery',
        temporalValue: '0 0 * * *',
        function: '',
      },
    ];

    this.commands = [
      {
        function: '',
        name: 'buyTicket',
        trigger: 'buyTicket',
        helpText: 'Buy a lottery ticket.',
        arguments: [
          {
            name: 'amount',
            type: 'number',
            helpText: 'The amount of tickets to buy.',
            position: 0,
          },
        ],
      },
      {
        function: '',
        name: 'viewTickets',
        trigger: 'viewTickets',
        helpText: 'View your lottery tickets.',
        arguments: [],
      },
      {
        function: '',
        name: 'nextDraw',
        trigger: 'nextDraw',
        helpText: 'View when the next draw is.',
        arguments: [],
      },
    ];
  }
}
