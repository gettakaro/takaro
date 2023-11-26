import { BuiltinModule } from '../../BuiltinModule.js';

export class Economy extends BuiltinModule {
  constructor() {
    super(
      'economy',
      'A set of commands to allow players to manage their currency.',
      JSON.stringify({
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        properties: {
          pendingAmount: {
            type: 'number',
            description:
              'When a player transfers money, they must confirm the transfer when the amount is equal or above this value. Set to 0 to disable',
            default: 0,
          },
        },
        required: [],
        additionalProperties: false,
      })
    );

    this.commands = [
      {
        function: '',
        name: 'balance',
        trigger: 'balance',
        helpText: 'Check your balance',
        arguments: [],
      },
      {
        function: '',
        name: 'topmoney',
        trigger: 'topmoney',
        helpText: 'List of the 10 players with the highest balance',
        arguments: [],
      },
      {
        function: '',
        name: 'confirmtransfer',
        trigger: 'confirmtransfer',
        helpText: 'Confirms a pending transfer',
      },
      {
        function: '',
        name: 'transfer',
        trigger: 'transfer',
        helpText: 'Transfer money to another player',
        arguments: [
          {
            name: 'receiver',
            type: 'player',
            helpText: 'The player to transfer money to',
            position: 0,
          },
          {
            name: 'amount',
            type: 'number',
            helpText: 'The amount of money to transfer',
            position: 1,
          },
        ],
      },
    ];
  }
}
