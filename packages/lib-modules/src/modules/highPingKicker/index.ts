import { BuiltinModule } from '../../BuiltinModule.js';

export class HighPingKicker extends BuiltinModule {
  constructor() {
    super(
      'highPingKicker',
      'Automatically kick players with high ping, with warnings and configurable thresholds',
      JSON.stringify({
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        properties: {
          pingThreshold: {
            type: 'integer',
            default: 200,
          },
          warningsBeforeKick: {
            type: 'integer',
            default: 3,
          },
        },
        required: [],
      })
    );

    this.cronJobs = [
      {
        name: 'Ping check',
        temporalValue: '*/5 * * * *',
        function: '',
      },
    ];
  }
}
