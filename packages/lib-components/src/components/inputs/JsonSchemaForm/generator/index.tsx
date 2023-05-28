import { AnySchema, SchemaObject } from 'ajv';
import { Button } from '../../../actions/Button';
import { Divider } from '../../../visual';
import { useFieldArray, useForm } from 'react-hook-form';
import { FormField } from './getFormField';
import { FC, useEffect } from 'react';

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

interface IFormInputs {
  name: string;
  description?: string;
  configFields: Input[];
}

interface ISchemaGeneratorProps {
  onSaveSchema: (schema: AnySchema) => void;
}

export const SchemaGenerator: FC<ISchemaGeneratorProps> = ({
  onSaveSchema,
}) => {
  const { control } = useForm<IFormInputs>({
    mode: 'onSubmit',
    // resolver: zodResolver(moduleValidationSchema),
  });

  const { fields, append } = useFieldArray({
    control,
    name: 'configFields',
  });

  useEffect(() => {
    generateJSONSchema(fields).then((schema) => {
      onSaveSchema(schema);
    });
  }, [fields]);

  return (
    <div>
      {fields.map((field) => {
        return (
          <>
            <FormField input={field} control={control} />
            <Divider />
          </>
        );
      })}

      <Button
        text="Add Config Field"
        type="button"
        onClick={() => {
          append({
            name: 'test',
            type: InputType.string,
            description: 'test',
            required: true,
            default: 'test',
          });
        }}
      />
    </div>
  );
};
