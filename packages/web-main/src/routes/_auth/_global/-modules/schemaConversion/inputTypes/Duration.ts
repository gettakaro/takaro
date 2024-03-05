import { BaseObject, BaseProperty, InputType } from '.';

export interface DurationInput extends BaseObject {
  type: InputType.duration;
  default?: number;
}

export class DurationProperty extends BaseProperty {
  constructor(input: DurationInput) {
    super(input);
    this.property['x-component'] = InputType.duration;
    this.property.type = 'number';
  }
}
