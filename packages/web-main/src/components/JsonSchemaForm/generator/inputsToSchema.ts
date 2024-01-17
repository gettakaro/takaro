import { TakaroConfigSchema } from '.';
import { SchemaObject } from 'ajv';
import { UiSchema } from '@rjsf/utils';
import { Input, AnyInput, InputType, SubType } from './inputTypes';
import { UIWidgets } from '../widgets';

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

export function inputsToUiSchema(inputs: Array<Input>): UiSchema {
  const uiSchema: UiSchema = {};

  for (const input of inputs) {
    switch (input.type) {
      case InputType.enum:
        if (input.subType === SubType.item) {
          uiSchema[input.name] = {
            'ui:widget': UIWidgets.item,
          };
        }
    }
  }

  return uiSchema;
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
      // switch from subType.custom to subType.item does not get rid of default value
      if (input.subType === SubType.item) {
        delete res.default;
      }

      res.enum = input.values ?? [];
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
