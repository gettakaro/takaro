import { InputType, BaseObject, BaseProperty } from '.';

export interface BooleanInput extends BaseObject {
  type: InputType.boolean;
  default?: boolean;
}

export class BooleanProperty extends BaseProperty {
  constructor(input: BooleanInput) {
    super(input);
    this.property.type = 'boolean';
  }
}
