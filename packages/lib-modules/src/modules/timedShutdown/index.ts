import { ModuleTransferDTO, ICronJob, ModuleTransferVersionDTO } from '../../BuiltinModule.js';

export class TimedShutdown extends ModuleTransferDTO<TimedShutdown> {
  constructor() {
    super();

    this.name = 'timedShutdown';
    this.versions = [
      new ModuleTransferVersionDTO({
        tag: '0.0.1',
        description: 'Automatically shut down the server at a specific time.',
        configSchema: JSON.stringify({
          $schema: 'http://json-schema.org/draft-07/schema#',
          type: 'object',
          properties: {
            warningMessage: {
              type: 'string',
              title: 'Warning message',
              description: 'Message to send to players before the server shuts down.',
              default: 'Server is shutting down in 5 minutes!',
              minLength: 1,
              maxLength: 1024,
            },
          },
          required: ['warningMessage'],
        }),

        cronJobs: [
          new ICronJob({
            name: 'Shutdown',
            temporalValue: '3 30 * * *',
            function: this.loadFn('cronJobs', 'Shutdown'),
          }),
          new ICronJob({
            name: 'warning',
            temporalValue: '3 25 * * *',
            function: this.loadFn('cronJobs', 'warning'),
          }),
        ],
      }),
    ];
  }
}
