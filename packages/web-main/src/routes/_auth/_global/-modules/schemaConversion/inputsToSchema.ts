import { StrictRJSFSchema, UiSchema } from '@rjsf/utils';
import { AnyInput, InputType } from './inputTypes';
import { EnumerationProperty } from './inputTypes/Enumeration';
import { BooleanProperty } from './inputTypes/Boolean';
import { ArrayProperty } from './inputTypes/Array';
import { ItemProperty } from './inputTypes/Item';
import { DurationProperty } from './inputTypes/Duration';
import { CountryProperty } from './inputTypes/Country';
import { NumberProperty } from './inputTypes/Number';
import { TextProperty } from './inputTypes/Text';

export function inputsToSchema(inputs: Array<AnyInput>): StrictRJSFSchema {
  const schema: StrictRJSFSchema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    required: [],
    additionalProperties: false,
  };

  if (inputs.length !== 0) {
    schema.properties = {};
  }

  for (const input of inputs) {
    if (input.required === true) {
      schema.required?.push(input.name);
    }
    if (schema.properties) {
      schema.properties[input.name] = getJsonSchemaElement(input);
    }
  }

  return schema;
}

function getJsonSchemaElement(input: AnyInput) {
  switch (input.type) {
    case InputType.number:
      return new NumberProperty(input).getProperty();
    case InputType.text:
      return new TextProperty(input).getProperty();
    case InputType.enumeration:
      return new EnumerationProperty(input).getProperty();
    case InputType.boolean:
      return new BooleanProperty(input).getProperty();
    case InputType.array:
      return new ArrayProperty(input).getProperty();
    case InputType.item:
      return new ItemProperty(input).getProperty();
    case InputType.duration:
      return new DurationProperty(input).getProperty();
    case InputType.country:
      return new CountryProperty(input).getProperty();
    default:
      throw new Error('Unknown input type');
  }
}

export function inputsToUiSchema(inputs: Array<AnyInput>): UiSchema {
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
