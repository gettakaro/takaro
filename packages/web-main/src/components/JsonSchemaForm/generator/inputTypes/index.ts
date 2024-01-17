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

export interface EnumInput extends BaseObject {
  type: InputType.enum;
  subType: SubType;
  values: string[];
  // Item cannot have default value because the items will be different for each game
  // and potentially server (mods)
  default?: this['subType'] extends 'custom' ? string : never;
}

interface ArrayInput extends BaseObject {
  type: InputType.array;
  subType: SubType;
  values: string[];
  default?: this['subType'] extends 'custom' ? string[] : never;
}

export type AnyInput = EnumInput | NumberInput | StringInput | BooleanInput | ArrayInput;
export type Input = AnyInput & { name: string };
