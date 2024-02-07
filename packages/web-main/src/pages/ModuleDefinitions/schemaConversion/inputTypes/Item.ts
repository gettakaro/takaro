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

    if (input.multiple) {
      this.property.type = 'array';
      this.property.uniqueItems = true;
      this.property.items = { type: 'string' };
    } else {
      this.property.type = 'string';
    }
  }
}
