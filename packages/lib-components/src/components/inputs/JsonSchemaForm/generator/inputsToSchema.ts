import { TakaroConfigSchema } from '.';
import { SchemaObject } from 'ajv';
import { Input, AnyInput, InputType } from './InputTypes';

export function inputsToSchema(inputs: Array<Input>): TakaroConfigSchema {
  const schema: TakaroConfigSchema = {
    type: 'object',
    properties: {},
    required: [],
  };

  for (const input of inputs) {
    if (input.required !== false) {
      schema.required.push(input.name);
    }
    schema.properties[input.name] = getJsonSchemaElement(input);
  }

  return schema;
}

function getJsonSchemaElement(input: AnyInput) {
  const res: SchemaObject = {
    type: input.type,
  };

  if (input.default !== undefined) {
    res.default = input.default;
  }

  if (input.name) {
    res.title = input.name;
  }

  if (input.description) {
    res.description = input.description;
  }

  switch (input.type) {
    case InputType.enum:
      res.enum = input.enum ?? [];
      res.type = 'string';
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

    case InputType.array:
      res.items = { type: 'string' };
      break;

    default:
      throw new Error('Unknown input type');
  }

  return res;
}
