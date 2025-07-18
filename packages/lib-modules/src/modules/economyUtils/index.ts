import { ModuleTransferDTO, ICommand, ICronJob, IPermission, ModuleTransferVersionDTO } from '../../BuiltinModule.js';

export class EconomyUtils extends ModuleTransferDTO<EconomyUtils> {
  constructor() {
    super();

    this.name = 'economyUtils';
    this.author = 'Takaro';
    this.supportedGames = ['all'];
    this.versions = [
      new ModuleTransferVersionDTO({
        tag: '0.0.2',
        description: 'A set of commands to allow players to manage their currency.',
        configSchema: JSON.stringify({
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
            zombieKillReward: {
              title: 'Zombie kill reward',
              type: 'number',
              description:
                'The default amount of currency a player receives for killing a zombie. This can be overridden by roles.',
              default: 1,
            },
          },
          required: [],
          additionalProperties: false,
        }),
        permissions: [
          new IPermission({
            permission: 'ECONOMY_UTILS_MANAGE_CURRENCY',
            friendlyName: 'Manage currency',
            description:
              'Allows players to manage currency of other players. This includes granting and revoking currency.',
            canHaveCount: false,
          }),
          new IPermission({
            permission: 'ZOMBIE_KILL_REWARD_OVERRIDE',
            friendlyName: 'Zombie kill reward override',
            description: 'Allows a role to override the amount of currency a player receives for killing a entity.',
            canHaveCount: true,
          }),
        ],
        cronJobs: [
          new ICronJob({
            function: this.loadFn('cronJobs', 'zombieKillReward'),
            name: 'zombieKillReward',
            temporalValue: '*/5 * * * *',
          }),
        ],

        commands: [
          new ICommand({
            function: this.loadFn('commands', 'balance'),
            name: 'balance',
            trigger: 'balance',
            helpText: 'Check your balance.',
            arguments: [],
          }),
          new ICommand({
            function: this.loadFn('commands', 'topCurrency'),
            name: 'topCurrency',
            trigger: 'topcurrency',
            helpText: 'List of the 10 players with the highest balance.',
            arguments: [],
          }),
          new ICommand({
            function: this.loadFn('commands', 'grantCurrency'),
            name: 'grantCurrency',
            trigger: 'grantcurrency',
            helpText: 'Grant money to a player. The money is not taken from your own balance but is new currency.',
            requiredPermissions: ['ECONOMY_UTILS_MANAGE_CURRENCY'],
            arguments: [
              {
                name: 'receiver',
                type: 'player',
                helpText: 'The player to grant currency to.',
                position: 0,
                defaultValue: null,
              },
              {
                name: 'amount',
                type: 'number',
                helpText: 'The amount of money.',
                position: 1,
                defaultValue: null,
              },
            ],
          }),
          new ICommand({
            function: this.loadFn('commands', 'revokeCurrency'),
            name: 'revokeCurrency',
            trigger: 'revokecurrency',
            helpText: 'Revokes money from a player. The money disappears.',
            requiredPermissions: ['ECONOMY_UTILS_MANAGE_CURRENCY'],
            arguments: [
              {
                name: 'receiver',
                type: 'player',
                helpText: 'The player to revoke currency from.',
                position: 0,
                defaultValue: null,
              },
              {
                name: 'amount',
                type: 'number',
                helpText: 'The amount of money.',
                position: 1,
                defaultValue: null,
              },
            ],
          }),
          new ICommand({
            function: this.loadFn('commands', 'confirmTransfer'),
            name: 'confirmTransfer',
            trigger: 'confirmtransfer',
            helpText: 'Confirms a pending transfer.',
            arguments: [],
          }),
          new ICommand({
            function: this.loadFn('commands', 'transfer'),
            name: 'transfer',
            trigger: 'transfer',
            helpText: 'Transfer money to another player.',
            arguments: [
              {
                name: 'receiver',
                type: 'player',
                helpText: 'The player to transfer money to.',
                position: 0,
                defaultValue: null,
              },
              {
                name: 'amount',
                type: 'number',
                helpText: 'The amount of money to transfer.',
                position: 1,
                defaultValue: null,
              },
            ],
          }),
          new ICommand({
            function: this.loadFn('commands', 'claim'),
            name: 'claim',
            trigger: 'claim',
            helpText: 'Claim your pending shop orders.',
            arguments: [
              {
                name: 'all',
                type: 'boolean',
                helpText: 'If true, claim ALL pending orders. If false, claim only the first one.',
                position: 0,
                defaultValue: 'false',
              },
            ],
          }),
          new ICommand({
            function: this.loadFn('commands', 'shop'),
            name: 'shop',
            trigger: 'shop',
            helpText: 'Browse the shop and view available items.',
            arguments: [
              {
                name: 'page',
                type: 'number',
                helpText: 'Display more items from the shop by specifying a page number.',
                position: 0,
                defaultValue: '1',
              },
              {
                name: 'item',
                type: 'number',
                helpText: 'Select a specific item to view more details.',
                position: 1,
                defaultValue: '0',
              },
              {
                name: 'action',
                type: 'string',
                helpText: 'Perform an action on the selected item. Currently only "buy" is supported.',
                position: 2,
                defaultValue: 'none',
              },
            ],
          }),
        ],
      }),
    ];
  }
}
