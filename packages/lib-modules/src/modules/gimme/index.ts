import { ModuleTransferDTO, ICommand, ModuleTransferVersionDTO } from '../../BuiltinModule.js';

export class Gimme extends ModuleTransferDTO<Gimme> {
  constructor() {
    super();

    this.name = 'gimme';
    this.versions = [
      new ModuleTransferVersionDTO({
        tag: '0.0.2',
        description: 'Randomly selects item from a list of items and entities.',
        configSchema: JSON.stringify({
          $schema: 'http://json-schema.org/draft-07/schema#',
          type: 'object',
          properties: {
            items: {
              'x-component': 'item',
              type: 'array',
              title: 'Items',
              description: 'List of items that a player can receive.',
              uniqueItems: true,
              items: {
                type: 'object',
                title: 'Item',
                properties: {
                  item: {
                    type: 'string',
                    title: 'Item',
                  },
                  amount: {
                    type: 'number',
                    title: 'Amount',
                  },
                  quality: {
                    type: 'string',
                    title: 'Quality',
                  },
                },
              },
            },
            commands: {
              title: 'Commands',
              type: 'array',
              default: ['say hello from gimme'],
              items: {
                type: 'string',
              },
            },
          },
          required: ['items'],
          additionalProperties: false,
        }),
        uiSchema: JSON.stringify({
          items: {
            items: {
              item: {
                'ui:widget': 'item',
              },
            },
          },
        }),
        commands: [
          new ICommand({
            function: this.loadFn('commands', 'gimme'),
            name: 'gimme',
            trigger: 'gimme',
            helpText: 'Randomly selects item from a list of items and entities.',
            arguments: [],
          }),
        ],
      }),
    ];
  }
}
