import { BaseObject, BaseProperty, InputType } from '.';

export interface TextInput extends BaseObject {
  type: InputType.text;
  minLength?: number;
  maxLength?: number;
  default?: string;
}

export class TextProperty extends BaseProperty {
  constructor(input: TextInput) {
    super(input);
    this.property.type = 'string';

    if (input.minLength !== undefined) {
      this.property.minLength = input.minLength;
    }

    if (input.maxLength !== undefined) {
      this.property.maxLength = input.maxLength;
    }
  }
}
