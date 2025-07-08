import { ModuleTransferDTO, ICommand, ICronJob, IPermission, ModuleTransferVersionDTO } from '../../BuiltinModule.js';

export class Lottery extends ModuleTransferDTO<Lottery> {
  constructor() {
    super();

    this.name = 'lottery';
    this.versions = [
      new ModuleTransferVersionDTO({
        tag: '0.0.2',
        description: 'Players can buy tickets for a lottery, and the winner is chosen at random.',
        configSchema: JSON.stringify({
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
        }),
        permissions: [
          new IPermission({
            permission: 'LOTTERY_BUY',
            friendlyName: 'Buy Lottery Tickets',
            canHaveCount: false,
            description: 'Allows the player to buy lottery tickets.',
          }),
          new IPermission({
            permission: 'LOTTERY_VIEW_TICKETS',
            friendlyName: 'View Lottery Tickets',
            description: 'Allows the player to view his lottery tickets.',
            canHaveCount: false,
          }),
        ],
        cronJobs: [
          new ICronJob({
            name: 'drawLottery',
            temporalValue: '0 0 * * *',
            function: this.loadFn('cronJobs', 'drawLottery'),
          }),
        ],
        commands: [
          new ICommand({
            function: this.loadFn('commands', 'buyTicket'),
            name: 'buyTicket',
            trigger: 'buyTicket',
            helpText: 'Buy a lottery ticket.',
            requiredPermissions: ['LOTTERY_BUY'],
            arguments: [
              {
                name: 'amount',
                type: 'number',
                helpText: 'The amount of tickets to buy.',
                position: 0,
                defaultValue: null,
              },
            ],
          }),
          new ICommand({
            function: this.loadFn('commands', 'viewTickets'),
            name: 'viewTickets',
            trigger: 'viewTickets',
            helpText: 'View your lottery tickets.',
            requiredPermissions: ['LOTTERY_VIEW_TICKETS'],
            arguments: [],
          }),
          new ICommand({
            function: this.loadFn('commands', 'nextDraw'),
            name: 'nextDraw',
            trigger: 'nextDraw',
            helpText: 'View when the next draw is.',
            arguments: [],
          }),
        ],
      }),
    ];
  }
}
