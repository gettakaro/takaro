export enum InputType {
  // These are the default JSON Schema types
  string = 'string',
  number = 'number',
  boolean = 'boolean',
  array = 'array',
  select = 'select',
  item = 'item',
  country = 'country',
  duration = 'duration',
}

// TODO: required should not be a property of base since boolean does not have it
export interface BaseObject {
  type: InputType;
  required: boolean;
  name: string;
  description: string;
}

interface ItemInput extends BaseObject {
  type: InputType.item;
  default?: string;
  multiple: boolean;
}

interface CountryInput extends BaseObject {
  type: InputType.country;
  default?: string;
  multiple: boolean;
}

interface ArrayInput extends BaseObject {
  type: InputType.array;
  uniqueItems?: boolean;
  minItems?: number;
  maxItems?: number;
  default?: string[];
}

interface DurationInput extends BaseObject {
  type: InputType.duration;
  default?: number;
}

interface StringInput extends BaseObject {
  type: InputType.string;
  minLength?: number;
  maxLength?: number;
  default?: string;
}

interface NumberInput extends BaseObject {
  type: InputType.number;
  minimum?: number;
  maximum?: number;
  default?: number;
}

interface BooleanInput extends BaseObject {
  type: InputType.boolean;
  default?: boolean;
}

export interface SelectInput extends BaseObject {
  type: InputType.select;
  values: string[];
  multiple: boolean;
  default?: string | string[];
}

export type AnyInput =
  | SelectInput
  | NumberInput
  | StringInput
  | BooleanInput
  | ItemInput
  | CountryInput
  | DurationInput
  | ArrayInput;

export type Input = AnyInput & { name: string };
