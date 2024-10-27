import { BaseObject, BaseProperty, InputType } from '.';

export interface ItemInput extends BaseObject {
  type: InputType.item;
  default?: string;
  multiple: boolean;
}

export class ItemProperty extends BaseProperty {
  constructor(input: ItemInput) {
    super(input);
    this.property['x-component'] = InputType.item;

    const item = {
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
    };

    if (input.multiple) {
      this.property.type = 'array';
      this.property.title = 'Items';
      this.property.uniqueItems = true;
      this.property.items = item;
    } else {
      this.property.type = 'object';
      this.property.title = 'Item';
      this.property.properties = {
        item: {
          type: 'string',
          title: 'Item Name',
        },
        amount: {
          type: 'number',
          title: 'Amount',
        },
        quality: {
          type: 'string',
          title: 'Quality',
        },
      };
    }
  }
}
