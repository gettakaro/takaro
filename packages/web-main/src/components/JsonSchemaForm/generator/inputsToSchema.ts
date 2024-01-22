import { StrictRJSFSchema } from '@rjsf/utils';
import { SchemaObject } from 'ajv';
import { UiSchema } from '@rjsf/utils';
import { Input, AnyInput, InputType } from './inputTypes';
import { countryCodes } from 'components/selects/CountrySelect/countryCodes';

export function inputsToSchema(inputs: Array<Input>): StrictRJSFSchema {
  const schema: StrictRJSFSchema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    properties: {},
    required: [],
    additionalProperties: false,
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

    case InputType.select:
      if (input.multiple) {
        res['x-component'] = InputType.select;
        res.type = 'array';
        res.uniqueItems = true;
        res.items = { type: 'string', enum: input.values ?? [], minItems: 1 };
      } else {
        res.enum = input.values;
        res.type = 'string';
      }
      break;

    case InputType.boolean:
      break;

    case InputType.array:
      (res.type = 'array'), (res.items = { type: 'string' });
      break;

    case InputType.item:
      res['x-component'] = InputType.item;
      if (input.multiple) {
        res.type = 'array';
        res.uniqueItems = true;
        res.items = { type: 'string' };
      } else {
        res.type = 'string';
      }
      break;

    case InputType.duration:
      // required because duration in schema looks the same as number
      res['x-component'] = InputType.duration;
      res.type = 'number';
      res.minimum = 1; // should atleast be 1 millisecond
      break;

    case InputType.country:
      res['x-component'] = InputType.country;
      const oneOf = countryCodes.map(({ code, name }) => ({ const: code, title: name }));
      if (input.multiple) {
        (res.type = 'array'), (res.uniqueItems = true), (res.items = { type: 'string', anyOf: oneOf });
      } else {
        (res.type = 'string'), (res.oneOf = oneOf);
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
    if (input.type === InputType.duration) {
      uiSchema[input.name] = {
        'ui:widget': InputType.duration,
      };
    }
  }

  return uiSchema;
}
