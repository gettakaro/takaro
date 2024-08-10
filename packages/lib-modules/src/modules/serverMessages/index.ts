import { BuiltinModule, ICronJob } from '../../BuiltinModule.js';

export class ServerMessages extends BuiltinModule<ServerMessages> {
  constructor() {
    super(
      'serverMessages',
      'Send automated, rotated, configurable messages to players on the server.',
      JSON.stringify({
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        properties: {
          messages: {
            type: 'array',
            title: 'Messages',
            description: 'List of messages that will be sent to players on the server.',
            default: [
              // prettier-ignore
              'This is an automated message, don\'t forget to read the server rules!',
            ],
            items: {
              type: 'string',
              minLength: 5,
              maxLength: 1024,
            },
            minItems: 1,
          },
        },
        required: ['messages'],
      }),
    );

    this.cronJobs = [
      new ICronJob({
        name: 'Automated message',
        temporalValue: '*/30 * * * *',
        function: this.loadFn('cronJobs', 'Automated message'),
      }),
    ];
  }
}
