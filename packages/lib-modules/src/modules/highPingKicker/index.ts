import { BuiltinModule, ICronJob } from '../../BuiltinModule.js';

export class HighPingKicker extends BuiltinModule<HighPingKicker> {
  constructor() {
    super(
      'highPingKicker',
      'Automatically kick players with high ping, with warnings and configurable thresholds.',
      '0.0.1',
      JSON.stringify({
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        properties: {
          pingThreshold: {
            type: 'number',
            title: 'Ping threshold',
            description: 'A ping value that is deemed too high and prompts a warning.',
            default: 200,
            minimum: 0,
          },
          warningsBeforeKick: {
            type: 'number',
            title: 'Kick warnings',
            description: 'Number of warnings before a player is kicked.',
            default: 3,
            minimum: 0,
          },
        },
        required: [],
      }),
    );

    this.cronJobs = [
      new ICronJob({
        name: 'Ping check',
        temporalValue: '*/5 * * * *',
        function: this.loadFn('cronJobs', 'Ping check'),
      }),
    ];
  }
}
