import { ModuleTransferDTO, ICommand, ModuleTransferVersionDTO } from '../../BuiltinModule.js';

export class Utils extends ModuleTransferDTO<Utils> {
  constructor() {
    super();

    this.name = 'utils';
    this.versions = [
      new ModuleTransferVersionDTO({
        tag: '0.0.1',
        description: 'A collection of useful commands',
        configSchema: JSON.stringify({
          $schema: 'http://json-schema.org/draft-07/schema#',
          type: 'object',
          additionalProperties: false,
        }),
        commands: [
          new ICommand({
            function: this.loadFn('commands', 'ping'),
            name: 'ping',
            trigger: 'ping',
            helpText: 'Replies with pong, useful for testing if the connection works.',
            arguments: [],
          }),
          new ICommand({
            function: this.loadFn('commands', 'help'),
            name: 'help',
            trigger: 'help',
            helpText: 'The text you are reading right now, displays information about commands.',
            arguments: [
              {
                name: 'command',
                type: 'string',
                defaultValue: 'all',
                helpText: 'The command to get help for',
                position: 0,
              },
            ],
          }),
        ],
      }),
    ];
  }
}
