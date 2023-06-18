import { FC, useEffect, Fragment } from 'react';
import { AnySchema } from 'ajv';
import { Button, Divider } from '../../../../components';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { ConfigField } from './ConfigField';
import { zodResolver } from '@hookform/resolvers/zod';
import { validationSchema } from './validationSchema';
import { AiOutlinePlus as PlusIcon } from 'react-icons/ai';
import { InputType, Input } from './InputTypes';
import { Form } from './style';
import { inputsToSchema } from './inputsToSchema';

export interface TakaroConfigSchema {
  type: 'object';
  properties: {
    [name: string]: any;
  };
  required: string[];
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
  const { control, handleSubmit, getValues, resetField } = useForm<IFormInputs>(
    {
      mode: 'onSubmit',
      resolver: zodResolver(validationSchema),
      defaultValues: {
        // @ts-expect-error 😠 form types are weird
        configFields: schemaToInputs(initialSchema),
      },
    }
  );

  const { configFields } = useWatch<IFormInputs>({ control });

  const { append, fields, remove } = useFieldArray({
    control,
    name: 'configFields',
  });

  useEffect(() => {
    if (!configFields?.length) {
      append({
        name: 'Default name',
        type: InputType.string,
        description: 'A helpful description',
        required: true,
      });
    }
  }, []);

  useEffect(() => {
    onSubmit();
  }, [configFields]);

  const onSubmit = () => {
    const formValues = getValues();
    const schema = inputsToSchema(formValues.configFields);
    onSchemaChange(schema);
  };

  const formValues = getValues();

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      {formValues.configFields
        ? fields.map((field, index) => {
            return (
              <Fragment key={`config-field-wrapper-${field.id}`}>
                <ConfigField
                  key={`config-field-${field.id}`}
                  id={field.id}
                  input={field}
                  control={control}
                  index={index}
                  remove={remove}
                  resetField={resetField}
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
