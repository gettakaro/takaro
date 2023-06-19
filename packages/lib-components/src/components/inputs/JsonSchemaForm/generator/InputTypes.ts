export enum InputType {
  string = 'string',
  number = 'number',
  boolean = 'boolean',
  enum = 'enum',
  array = 'array',
}

export interface BaseObject {
  type: InputType;
  required?: boolean;
  name?: string;
  description?: string;
}

export interface EnumInput extends BaseObject {
  type: InputType.enum;
  enum: string[];
  default?: string;
}

export interface NumberInput extends BaseObject {
  type: InputType.number;
  minimum?: number;
  maximum?: number;
  default?: number;
}

export interface StringInput extends BaseObject {
  type: InputType.string;
  minLength?: number;
  maxLength?: number;
  default?: string;
}

export interface BooleanInput extends BaseObject {
  type: InputType.boolean;
  default?: boolean;
}

export interface ArrayInput extends BaseObject {
  type: InputType.array;
  items: AnyInputExceptArray;
  default?: string[];
}

export type AnyInputExceptArray =
  | EnumInput
  | NumberInput
  | StringInput
  | BooleanInput;
export type AnyInput = AnyInputExceptArray | ArrayInput;

export type Input = AnyInput & { name: string };
