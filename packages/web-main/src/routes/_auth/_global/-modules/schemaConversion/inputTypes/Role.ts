import { BaseObject, BaseProperty, InputType } from '.';

export interface RoleInput extends BaseObject {
  type: InputType.role;
  default?: string | string[];
  multiple: boolean;
}

export class RoleProperty extends BaseProperty {
  constructor(input: RoleInput) {
    super(input);
    this.property['x-component'] = InputType.role;

    if (input.multiple) {
      this.property.type = 'array';
      this.property.uniqueItems = true;
      this.property.items = { type: 'string' };
    } else {
      this.property.type = 'string';
    }
  }
}
