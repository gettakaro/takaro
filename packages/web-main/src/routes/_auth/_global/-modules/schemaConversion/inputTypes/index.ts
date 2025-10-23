import { EnumerationInput } from './Enumeration';
import { ItemInput } from './Item';
import { NumberInput } from './Number';
import { TextInput } from './Text';
import { BooleanInput } from './Boolean';
import { CountryInput } from './Country';
import { DurationInput } from './Duration';
import { ArrayInput } from './Array';
import { RoleInput } from './Role';
import { SchemaObject } from 'ajv';

export type AnyInput =
  | EnumerationInput
  | NumberInput
  | TextInput
  | BooleanInput
  | ItemInput
  | CountryInput
  | DurationInput
  | ArrayInput
  | RoleInput;

export enum InputType {
  // These are the default JSON Schema types
  text = 'text',
  number = 'number',
  boolean = 'boolean',
  array = 'array',
  enumeration = 'enumeration',
  item = 'item',
  country = 'country',
  duration = 'duration',
  role = 'role',
}

export interface BaseObject {
  type: InputType;
  required: boolean;
  name: string;
  description: string;
}

export abstract class BaseProperty {
  protected readonly property: SchemaObject;

  constructor(input: AnyInput) {
    this.property = {
      title: input.name,
    };

    if (input.description) {
      this.property.description = input.description;
    }

    if (input.default !== undefined) {
      this.property.default = input.default;
    }
  }

  public getProperty(): SchemaObject {
    return this.property;
  }
}
