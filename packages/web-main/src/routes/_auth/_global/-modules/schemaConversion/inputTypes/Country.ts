import { BaseObject, BaseProperty, InputType } from '.';
import { countryCodes } from 'components/selects/CountrySelectField/countryCodes';

export interface CountryInput extends BaseObject {
  type: InputType.country;
  default?: string;
  multiple: boolean;
}

export class CountryProperty extends BaseProperty {
  constructor(input: CountryInput) {
    super(input);
    this.property['x-component'] = InputType.country;
    const countriesEnum = countryCodes.map(({ code, name }) => ({ const: code, title: name }));

    if (input.multiple) {
      this.property.type = 'array';
      this.property.uniqueItems = true;
      this.property.items = { type: 'string', anyOf: countriesEnum };
    } else {
      this.property.type = 'string';
      this.property.oneOf = countriesEnum;
    }
  }
}
