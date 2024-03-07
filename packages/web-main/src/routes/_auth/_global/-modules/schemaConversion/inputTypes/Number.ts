import { BaseObject, BaseProperty, InputType } from '.';

export interface NumberInput extends BaseObject {
  type: InputType.number;
  minimum?: number;
  maximum?: number;
  default?: number;
}

export class NumberProperty extends BaseProperty {
  constructor(input: NumberInput) {
    super(input);
    this.property.type = 'number';

    if (input.minimum !== undefined) {
      this.property.minimum = input.minimum;
    }
    if (input.maximum !== undefined) {
      this.property.maximum = input.maximum;
    }
  }
}
