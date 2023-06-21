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
import { schemaToInputs } from './SchemaToInputs';

export interface TakaroConfigSchema {
  type: 'object';
  properties: {
    [name: string]: any;
  };
  required: string[];
}

interface ISchemaGeneratorProps {
  onSchemaChange: (schema: AnySchema) => void;
  // e.g. when a user edits a module config, we start from an existing schema
  initialSchema?: TakaroConfigSchema;
}

export interface IFormInputs {
  name: string;
  description?: string;
  configFields: Input[];
}

export const SchemaGenerator: FC<ISchemaGeneratorProps> = ({
  onSchemaChange,
  initialSchema,
}) => {
  const { control, handleSubmit, getValues, resetField } = useForm<IFormInputs>(
    {
      mode: 'onChange',
      resolver: async (data, context, options) => {
        // you can debug your validation schema here
        console.log('formData', data);
        console.log(
          'validation result',
          await zodResolver(validationSchema)(data, context, options)
        );
        return zodResolver(validationSchema)(data, context, options);
      },
      defaultValues: {
        configFields: initialSchema ? schemaToInputs(initialSchema) ?? [] : [],
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
        name: 'Config field 1',
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
            name: `Config field ${fields.length + 1}`,
            type: InputType.string,
            description: 'A helpful description',
            default: '',
          });
        }}
      />

      {/* TODO: There is currently a bug in react-hook-form regarding refine, which in our case breaks the 
        unique name validation. So for now we just add note to the user that the name must be unique 
        issue: https://github.com/react-hook-form/resolvers/issues/538#issuecomment-1504222680
        */}
      <p>Make sure all config field names are unique!</p>
      <Button text="Save schema" type="submit" />
    </Form>
  );
};
