import { BuiltinModule } from '../../BuiltinModule.js';
import { EventTypes } from '../../dto/index.js';

export class DailyLoginReward extends BuiltinModule {
  constructor() {
    super(
      'dailyLoginReward',
      'A module that rewards players for logging in daily.',
      JSON.stringify({
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        properties: {
          multiplier: {
            type: 'number',
            description: 'How much to multiply the reward by after consecutive day.',
            default: 0.05,
          },
          initialReward: {
            type: 'number',
            description: 'How much to reward the player on the first day.',
            default: 100,
          },
          maxReward: {
            type: 'number',
            description: 'The maximum reward a player can get.',
            default: 1000,
          },
        },
        additionalProperties: false,
      })
    );

    this.hooks = [
      {
        eventType: EventTypes.PLAYER_CONNECTED,
        name: 'dailyRewardChecker',
        function: '',
      },
    ];
  }
}
