import { SchemaObject } from 'ajv';
import { Input, InputType } from './inputTypes';
import { StrictRJSFSchema } from '@rjsf/utils';

export function schemaToInputs(schema: SchemaObject): Input[] {
  const normalizedSchema: SchemaObject = {
    type: 'object',
    properties: schema.properties ?? {},
    required: schema.required ?? [],
    title: schema.title,
  };

  return Object.entries(normalizedSchema.properties).map(([name, propertySchema]) => {
    const property = propertySchema as StrictRJSFSchema;

    const input: Record<string, any> = {
      name,
      type: property.type,
      required: normalizedSchema.required.includes(name),
    };

    if (property.default !== undefined && property.default !== null) {
      input.default = property.default as any;
    }

    if (property.description) {
      input.description = property.description;
    }

    // input.type are the default JSON Schema types
    switch (input.type) {
      case 'number':
        if (property['x-component'] === InputType.duration) {
          input.type = InputType.duration;
        }
        if (property.minimum) {
          input.minimum = property.minimum;
        }

        if (property.maximum) {
          input.maximum = property.maximum;
        }
        break;

      case 'string':
        if (property['x-component'] === InputType.item) {
          input.type = InputType.item;
          input.multiple = false;
        } else if (property['x-component'] === InputType.country) {
          input.type = InputType.country;
          input.multiple = false;
        } else if (property.enum) {
          input.type = InputType.select;
          input.multiple = false;
          input.values = property.enum;
        } else {
          // InputType.string
          input.minLength = property.minLength;
          input.maxLength = property.maxLength;
        }

        break;
      case 'array':
        input.multiple = true;
        if (property['x-component'] === InputType.item) {
          input.type = InputType.item;
        } else if (property['x-component'] === InputType.country) {
          input.type = InputType.country;
        } else {
          input.values = property.items;
        }
        break;

      case 'boolean':
        break;

      default:
        throw new Error('Unknown input type');
    }
    return input as Input;
  });
}
