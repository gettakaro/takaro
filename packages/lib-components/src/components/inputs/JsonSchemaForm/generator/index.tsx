import { AnySchema, SchemaObject } from 'ajv';
import { Button, Divider } from '../../../../components';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { FormField } from './getFormField';
import { FC, useEffect, Fragment } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { validationSchema } from './validationSchema';
import { AiOutlinePlus as PlusIcon } from 'react-icons/ai';
import { AnyInputExceptArray, InputType, Input } from './InputTypes';
import { Form } from './style';

interface TakaroConfigSchema {
  type: 'object';
  properties: {
    [name: string]: any;
  };
  required: string[];
}

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

export function generateJSONSchema(inputs: Array<Input>): TakaroConfigSchema {
  const schema: TakaroConfigSchema = {
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

export function schemaToInputs(schema: TakaroConfigSchema): Input[] {
  const normalizedSchema: TakaroConfigSchema = {
    type: 'object',
    properties: schema.properties,
    required: schema.required,
  };

  const inputs = [];

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

export interface IFormInputs {
  name: string;
  description?: string;
  configFields: Input[];
}

interface ISchemaGeneratorProps {
  onSchemaChange: (schema: AnySchema) => void;
  initialSchema?: Input[];
}

export const SchemaGenerator: FC<ISchemaGeneratorProps> = ({
  onSchemaChange,
  initialSchema,
}) => {
  const { control, handleSubmit, getValues } = useForm<IFormInputs>({
    mode: 'onSubmit',
    resolver: zodResolver(validationSchema),
    defaultValues: {
      // @ts-expect-error 😠 form types are weird
      configFields: schemaToInputs(initialSchema) ?? [],
    },
  });

  const { configFields } = useWatch<IFormInputs>({ control });

  const { append, fields, remove } = useFieldArray({
    control,
    name: 'configFields',
  });

  useEffect(() => {
    append({
      name: 'Default name',
      type: InputType.string,
      description: 'A helpful description',
      required: true,
      default: 'The default value',
    });
  }, []);

  useEffect(() => {
    onSubmit();
  }, [configFields]);

  const onSubmit = () => {
    const formValues = getValues();
    console.log(formValues);
    const schema = generateJSONSchema(formValues.configFields);
    onSchemaChange(schema);
  };

  const formValues = getValues();

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      {formValues.configFields
        ? fields.map((field, index) => {
            return (
              <Fragment key={`config-field-wrapper-${field.id}`}>
                <FormField
                  key={`config-field-${field.id}`}
                  id={field.id}
                  input={field}
                  control={control}
                  index={index}
                  remove={remove}
                />
                {index != fields.length - 1 && (
                  <Divider key={`config-field-divider-${field.id}`} />
                )}
              </Fragment>
            );
          })
        : []}
      <Button
        text="Config Field"
        type="button"
        fullWidth
        icon={<PlusIcon />}
        onClick={() => {
          append({
            name: 'Default name',
            type: InputType.string,
            description: 'A helpful description',
            required: true,
            default: 'The default value',
          });
        }}
      />
      <Button text="Save schema" type="submit" />
    </Form>
  );
};
