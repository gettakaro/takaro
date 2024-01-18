export enum InputType {
  // These are the default JSON Schema types
  string = 'string',
  number = 'number',
  boolean = 'boolean',
  enum = 'enum',
  array = 'array',

  // custom
  item = 'item',
  // TODO: add date, role, variable?
}

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

export interface EnumInput extends BaseObject {
  type: InputType.enum;
  values: string[];
  default?: string;
}

interface ArrayInput extends BaseObject {
  type: InputType.array;
  values: string[];
  default?: string[];
}

export type AnyInput = EnumInput | NumberInput | StringInput | BooleanInput | ArrayInput | ItemInput;
export type Input = AnyInput & { name: string };
