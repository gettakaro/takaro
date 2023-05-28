import { AnySchema, SchemaObject } from 'ajv';

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
  title?: string;
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
  default?: unknown[];
}

export type AnyInputExceptArray =
  | EnumInput
  | NumberInput
  | StringInput
  | BooleanInput;
export type AnyInput = AnyInputExceptArray | ArrayInput;

export type Input = AnyInput & { name: string };

function getJsonSchemaElement(input: AnyInputExceptArray) {
  const res: SchemaObject = {
    type: input.type,
  };

  if (input.default !== undefined) {
    res.default = input.default;
  }

  if (input.title) {
    res.title = input.title;
  }

  if (input.description) {
    res.description = input.description;
  }

  switch (input.type) {
    case InputType.enum:
      res.enum = input.enum;
      break;

    case InputType.number:
      if (input.minimum) {
        res.minimum = input.minimum;
      }

      if (input.maximum) {
        res.maximum = input.maximum;
      }

      break;

    case InputType.string:
      if (input.minLength) {
        res.minLength = input.minLength;
      }

      if (input.maxLength) {
        res.maxLength = input.maxLength;
      }

      break;

    case InputType.boolean:
      break;

    default:
      throw new Error('Unknown input type');
  }

  return res;
}

export async function generateJSONSchema(inputs: Array<Input>) {
  const schema: AnySchema = {
    type: 'object',
    properties: {},
    required: [],
  };

  for (const input of inputs) {
    schema.properties[input.name] = {
      type: input.type,
    };

    if (input.required !== false) {
      schema.required.push(input.name);
    }

    if (input.type === InputType.array) {
      schema.properties[input.name].items = getJsonSchemaElement(input.items);
    } else {
      schema.properties[input.name] = getJsonSchemaElement(input);
    }
  }

  return schema;
}
