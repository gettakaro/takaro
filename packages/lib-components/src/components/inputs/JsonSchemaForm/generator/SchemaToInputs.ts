import { TakaroConfigSchema } from '.';
import { Input, InputType } from './InputTypes';

export function schemaToInputs(schema: TakaroConfigSchema): Input[] {
  const normalizedSchema: TakaroConfigSchema = {
    type: 'object',
    properties: schema.properties ?? {},
    required: schema.required ?? [],
  };

  const inputs: any[] = [];

  for (const [name, property] of Object.entries(normalizedSchema.properties)) {
    const input: Record<string, any> = {
      name,
      type: property.type as InputType,
      required: normalizedSchema.required.includes(name),
    };

    if (property.default !== undefined) {
      input.default = property.default;
    }

    if (property.title) {
      input.title = property.title;
    }

    if (property.description) {
      input.description = property.description;
    }

    switch (property.type) {
      case InputType.enum:
        input.enum = property.enum;
        break;

      case InputType.number:
        if (property.minimum) {
          input.minimum = property.minimum;
        }

        if (property.maximum) {
          input.maximum = property.maximum;
        }

        break;

      case InputType.string:
        if (property.minLength) {
          input.minLength = property.minLength;
        }

        if (property.maxLength) {
          input.maxLength = property.maxLength;
        }

        break;

      case InputType.boolean:
        break;

      default:
        throw new Error('Unknown input type');
    }

    inputs.push(input);
  }

  return inputs as Input[];
}
