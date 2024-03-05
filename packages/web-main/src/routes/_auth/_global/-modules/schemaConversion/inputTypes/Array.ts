import { InputType, BaseObject, BaseProperty } from '.';

export interface ArrayInput extends BaseObject {
  type: InputType.array;
  uniqueItems?: boolean;
  minItems?: number;
  maxItems?: number;
  default?: string[];
}

export class ArrayProperty extends BaseProperty {
  constructor(input: ArrayInput) {
    super(input);
    this.property.type = 'array';
    this.property.items = { type: 'string' };

    if (input.minItems !== undefined) {
      this.property.minItems = input.minItems;
    }
    if (input.maxItems !== undefined) {
      this.property.maxItems = input.maxItems;
    }
    if (input.uniqueItems !== undefined) {
      this.property.uniqueItems = input.uniqueItems;
    }
  }
}
