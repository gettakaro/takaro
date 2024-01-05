export * from './enum';

import { EnumInput } from './enum';

export enum InputType {
  string = 'string',
  number = 'number',
  boolean = 'boolean',
  enum = 'enum',
  array = 'array',
}

// Array and Enum have special subtypes
export enum SubType {
  custom = 'custom', // user picks the values himself
  item = 'item', // game items
}

export interface BaseObject {
  type: InputType;
  required: boolean;
  name: string;
  description: string;
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

interface ArrayInput extends BaseObject {
  type: InputType.array;
  items: AnyInputExceptArray;
  default?: string[];
}

type AnyInputExceptArray = EnumInput | NumberInput | StringInput | BooleanInput;
export type AnyInput = AnyInputExceptArray | ArrayInput;
export type Input = AnyInput & { name: string };
