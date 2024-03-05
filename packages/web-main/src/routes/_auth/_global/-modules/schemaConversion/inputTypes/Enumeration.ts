import { BaseObject, BaseProperty, InputType } from '.';

export interface EnumerationInput extends BaseObject {
  type: InputType.enumeration;
  values: string[];
  multiple: boolean;
  default?: string | string[];
}

export class EnumerationProperty extends BaseProperty {
  constructor(input: EnumerationInput) {
    super(input);

    if (input.multiple) {
      // We need to set the x-component to enumeration so that the UI knows to render a select and not an array
      this.property['x-component'] = InputType.enumeration;
      this.property.type = 'array';
      this.property.uniqueItems = true;
      this.property.items = { type: 'string', enum: input.values ?? [] };
    } else {
      this.property.type = 'string';
      this.property.enum = input.values;
    }
  }
}
