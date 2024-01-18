import { StrictRJSFSchema } from '@rjsf/utils';
import { SchemaObject } from 'ajv';
import { UiSchema } from '@rjsf/utils';
import { Input, AnyInput, InputType } from './inputTypes';

export function inputsToSchema(inputs: Array<Input>): StrictRJSFSchema {
  const schema: StrictRJSFSchema = {
    type: 'object',
    properties: {},
    required: [],
  };

  for (const input of inputs) {
    if (input.required === true) {
      schema.required?.push(input.name);
    }
    schema.properties![input.name] = getJsonSchemaElement(input);
  }
  return schema;
}

function getJsonSchemaElement(input: AnyInput) {
  const res: SchemaObject = {
    type: input.type,
    title: input.name,
    description: input.description,
  };

  // not every input has a default value defined
  if (input.default !== undefined) {
    res.default = input.default;
  }

  switch (input.type) {
    case InputType.number:
      res.minimum = input.minimum;
      res.maximum = input.maximum;
      break;

    case InputType.string:
      res.minLength = input.minLength;
      res.maxLength = input.maxLength;
      break;

    case InputType.enum:
      res.enum = input.values;
      res.type = 'string';
      break;

    case InputType.boolean:
      break;

    case InputType.array:
      res.uniqueItems = true;
      // `required` only makes sure the [property key] is defined but not that it has a value different from `undefined`
      res.items = { type: 'string', enum: input.values ?? [], minItems: 1 };
      break;

    case InputType.item:
      if (res.multiple) {
        res.type = 'array';
        res.items = { type: 'string', uniqueItems: true, minItems: 1 };
      } else {
        res.type = 'string';
      }
      break;

    default:
      throw new Error('Unknown input type');
  }

  return res;
}

export function inputsToUiSchema(inputs: Array<Input>): UiSchema {
  const uiSchema: UiSchema = {};

  for (const input of inputs) {
    if (input.type === InputType.item) {
      uiSchema[input.name] = {
        'ui:widget': InputType.item,
      };
    }
  }

  return uiSchema;
}
