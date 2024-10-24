import { BuiltinModule, ICommand } from '../../BuiltinModule.js';

export class Gimme extends BuiltinModule<Gimme> {
  constructor() {
    super(
      'gimme',
      'Randomly selects an item from a list of items.',
      JSON.stringify({
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
      JSON.stringify({
        items: {
          items: {
            item: {
              'ui:widget': 'item',
            },
          },
        },
      }),
    );

    this.commands = [
      new ICommand({
        function: this.loadFn('commands', 'gimme'),
        name: 'gimme',
        trigger: 'gimme',
        helpText: 'Randomly selects item from a list of items and entities.',
        arguments: [],
      }),
    ];
  }
}
