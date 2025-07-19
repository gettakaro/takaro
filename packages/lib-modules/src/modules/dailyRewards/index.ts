import {
  ModuleTransferDTO,
  ICommand,
  IFunction,
  IHook,
  IPermission,
  ModuleTransferVersionDTO,
} from '../../BuiltinModule.js';

export class DailyRewards extends ModuleTransferDTO<DailyRewards> {
  constructor() {
    super();
    this.name = 'dailyRewards';
    this.author = 'Takaro';
    this.supportedGames = ['all'];
    this.versions = [
      new ModuleTransferVersionDTO({
        description: 'Provides daily login rewards with streak tracking',
        tag: '0.0.2',
        configSchema: JSON.stringify({
          $schema: 'http://json-schema.org/draft-07/schema#',
          type: 'object',
          properties: {
            baseReward: {
              type: 'number',
              title: 'Base Reward',
              description: 'Base amount of currency given for daily rewards. This is multiplied by streak level.',
              default: 100,
              minimum: 1,
            },
            maxStreak: {
              type: 'number',
              title: 'Maximum Streak',
              description: 'Maximum streak level a player can reach',
              default: 365,
              minimum: 1,
            },
            milestoneRewards: {
              type: 'array',
              title: 'Milestone Rewards',
              description: 'Additional rewards for reaching certain streak milestones',
              items: {
                type: 'object',
                properties: {
                  days: {
                    type: 'number',
                    description: 'Days needed to reach milestone',
                    minimum: 1,
                  },
                  reward: {
                    type: 'number',
                    description: 'Bonus reward amount',
                  },
                  message: {
                    type: 'string',
                    description: 'Message to show when milestone is reached',
                  },
                },
              },
              default: [
                { days: 7, reward: 1000, message: 'You did it! 7 days in a row!' },
                { days: 30, reward: 5000, message: "A whole month! You're on fire!" },
                { days: 90, reward: 20000, message: "90 days! You're unstoppable!" },
                { days: 180, reward: 50000, message: "Half a year! You're a legend!" },
                { days: 365, reward: 150000, message: "365 days! You're a true champion!" },
              ],
            },
          },
          required: ['baseReward', 'maxStreak', 'milestoneRewards'],
          additionalProperties: false,
        }),
        functions: [
          new IFunction({
            name: 'utils',
            function: this.loadFn('functions', 'utils'),
          }),
        ],

        permissions: [
          new IPermission({
            permission: 'DAILY_CLAIM',
            friendlyName: 'Claim Daily Rewards',
            description: 'Allows the player to claim daily rewards',
            canHaveCount: false,
          }),
          new IPermission({
            permission: 'DAILY_REWARD_MULTIPLIER',
            friendlyName: 'Multiplier',
            description:
              'Control the multiplier per role. This is useful to give your donors a little extra. Count is an integer multiplier.',
            canHaveCount: true,
          }),
        ],

        commands: [
          new ICommand({
            function: this.loadFn('commands', 'daily'),
            name: 'daily',
            trigger: 'daily',
            helpText: 'Claim your daily reward',
            requiredPermissions: ['DAILY_CLAIM'],
            arguments: [],
          }),
          new ICommand({
            function: this.loadFn('commands', 'streak'),
            name: 'streak',
            trigger: 'streak',
            helpText: 'Check your current daily reward streak and next claim time',
            arguments: [],
          }),
          new ICommand({
            function: this.loadFn('commands', 'topstreak'),
            name: 'topstreak',
            trigger: 'topstreak',
            helpText: 'Shows the players with highest daily reward streaks',
            arguments: [
              {
                name: 'count',
                type: 'number',
                defaultValue: '5',
                helpText: 'Number of players to show (max 25)',
                position: 0,
              },
            ],
          }),
        ],

        hooks: [
          new IHook({
            eventType: 'player-connected',
            name: 'dailyLoginCheck',
            function: this.loadFn('hooks', 'dailyLoginCheck'),
          }),
        ],
      }),
    ];
  }
}
