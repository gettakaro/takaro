import { forwardRef, Fragment } from 'react';
import { AnySchema } from 'ajv';
import { Button, Divider, Alert } from '../../../../components';
import { SubmitHandler, useFieldArray, useForm } from 'react-hook-form';
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

export interface IFormInputs {
  configFields: Input[];
}

interface ISchemaGeneratorProps {
  // e.g. when a user edits a module config, we start from an existing schema
  initialSchema?: TakaroConfigSchema;
  onSubmit?: (schema: AnySchema) => unknown;
  onSchemaChange?: (schema: AnySchema) => void;
}

export const SchemaGenerator = forwardRef<HTMLFormElement, ISchemaGeneratorProps>(
  ({ initialSchema, onSubmit }, ref) => {
    const { control, handleSubmit, getValues, resetField } = useForm<IFormInputs>({
      mode: 'onChange',
      resolver: zodResolver(validationSchema),
      defaultValues: {
        configFields: initialSchema ? schemaToInputs(initialSchema) : [],
      },
    });

    const { append, fields, remove } = useFieldArray({
      control,
      name: 'configFields',
    });

    const onSubmitWrapper: SubmitHandler<IFormInputs> = ({ configFields }) => {
      const schema = inputsToSchema(configFields);
      onSubmit && onSubmit(schema);
    };

    const formValues = getValues();
    console.log(formValues);

    return (
      <>
        <Alert text="It is crucial that each and every config field names is unique!" variant="warning" />
        <Form onSubmit={handleSubmit(onSubmitWrapper)} ref={ref}>
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
                    {index != fields.length - 1 && <Divider key={`config-field-divider-${field.id}`} />}
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
                required: false,
              });
            }}
          />

          {/* TODO: There is currently a bug in react-hook-form regarding refine, which in our case breaks the 
        unique name validation. So for now we just add note to the user that the name must be unique 
        issue: https://github.com/react-hook-form/resolvers/issues/538#issuecomment-1504222680
        */}
        </Form>
      </>
    );
  }
);
