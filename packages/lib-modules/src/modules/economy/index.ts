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
            title: 'Pending amount',
            type: 'number',
            description:
              'When a player transfers money, they must confirm the transfer when the amount is equal or above this value. Set to 0 to disable.',
            default: 0,
          },
        },
        required: [],
        additionalProperties: false,
      })
    );

    this.permissions = [
      {
        permission: 'ECONOMY_MANAGE_CURRENCY',
        friendlyName: 'Manage currency',
        description:
          'Allows players to manage currency of other players. This includes granting and revoking currency.',
      },
    ];

    this.commands = [
      {
        function: '',
        name: 'balance',
        trigger: 'balance',
        helpText: 'Check your balance.',
        arguments: [],
      },
      {
        function: '',
        name: 'topCurrency',
        trigger: 'topcurrency',
        helpText: 'List of the 10 players with the highest balance.',
        arguments: [],
      },
      {
        function: '',
        name: 'grantCurrency',
        trigger: 'grantcurrency',
        helpText: 'Grant money to a player. The money is not taken from your own balance but is new currency.',
        arguments: [
          {
            name: 'receiver',
            type: 'player',
            helpText: 'The player to grant currency to.',
            position: 0,
          },
          {
            name: 'amount',
            type: 'number',
            helpText: 'The amount of money.',
            position: 1,
          },
        ],
      },
      {
        function: '',
        name: 'revokeCurrency',
        trigger: 'revokecurrency',
        helpText: 'Grant money to a player. The money is not taken from your own balance but is new currency.',
        arguments: [
          {
            name: 'receiver',
            type: 'player',
            helpText: 'The player to revoke currency from.',
            position: 0,
          },
          {
            name: 'amount',
            type: 'number',
            helpText: 'The amount of money.',
            position: 1,
          },
        ],
      },
      {
        function: '',
        name: 'confirmTransfer',
        trigger: 'confirmtransfer',
        helpText: 'Confirms a pending transfer.',
      },
      {
        function: '',
        name: 'transfer',
        trigger: 'transfer',
        helpText: 'Transfer money to another player.',
        arguments: [
          {
            name: 'receiver',
            type: 'player',
            helpText: 'The player to transfer money to.',
            position: 0,
          },
          {
            name: 'amount',
            type: 'number',
            helpText: 'The amount of money to transfer.',
            position: 1,
          },
        ],
      },
    ];
  }
}
