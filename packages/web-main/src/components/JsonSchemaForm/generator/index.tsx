import { forwardRef, Fragment } from 'react';
import { UiSchema } from '@rjsf/utils';
import { AnySchema } from 'ajv';
import { Button, Divider, Alert } from '@takaro/lib-components';
import { SubmitHandler, useFieldArray, useForm } from 'react-hook-form';
import { ConfigField } from './ConfigField';
//import { zodResolver } from '@hookform/resolvers/zod';
//import { validationSchema } from './validationSchema';
import { AiOutlinePlus as PlusIcon } from 'react-icons/ai';
import { InputType, Input } from './inputTypes';
import { Form } from './style';
import { inputsToSchema, inputsToUiSchema } from './inputsToSchema';
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
  initialConfigSchema?: TakaroConfigSchema;
  initialUiSchema?: UiSchema;
  onSubmit?: (configSchema: AnySchema, uiSchema: UiSchema) => unknown;
  onSchemaChange?: (schema: AnySchema) => void;
  onUiSchemaChange?: (uiSchema: UiSchema) => void;
}

export const SchemaGenerator = forwardRef<HTMLFormElement, ISchemaGeneratorProps>(
  ({ initialConfigSchema, onSubmit, onSchemaChange, initialUiSchema = {}, onUiSchemaChange }, ref) => {
    const { control, handleSubmit, getValues, resetField } = useForm<IFormInputs>({
      mode: 'onChange',
      defaultValues: {
        configFields: initialConfigSchema ? schemaToInputs(initialConfigSchema, initialUiSchema) : [],
      },
    });

    const { append, fields, remove } = useFieldArray({
      control,
      name: 'configFields',
    });

    const submitHandler: SubmitHandler<IFormInputs> = ({ configFields }) => {
      const schema = inputsToSchema(configFields);
      const uiSchema = inputsToUiSchema(configFields);
      console.log('this fired');
      onSubmit && onSubmit(schema, uiSchema);
      onSchemaChange && onSchemaChange(schema);
      onUiSchemaChange && onUiSchemaChange(uiSchema);
    };

    const formValues = getValues();

    return (
      <>
        {fields.length === 0 && (
          <Alert
            variant="info"
            title="What are Config fields?"
            action={{
              execute: () =>
                append({
                  name: `Config field ${fields.length + 1}`,
                  type: InputType.string,
                  description: '',
                  required: false,
                }),
              text: 'Add first config field',
            }}
            text={`Config fields are a way to control the behavior of your module. When a module is installed
                  on a game server, Config fields can be tweaked to change the behavior of the module. For example,
                  if you want to write a module that allows players to teleport to each other, you might want to have a config
                  field that controls the cooldown of the command.
                `}
          />
        )}

        {fields.length > 0 && <Alert text="Every config field name should be unique!" variant="warning" />}
        <Form onSubmit={handleSubmit(submitHandler)} ref={ref}>
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
          {fields.length > 0 && (
            <Button
              text="Config Field"
              type="button"
              fullWidth
              icon={<PlusIcon />}
              onClick={() => {
                append({
                  name: `Config field ${fields.length + 1}`,
                  type: InputType.string,
                  description: '',
                  required: false,
                });
              }}
            />
          )}

          {/* TODO: There is currently a bug in react-hook-form regarding refine, which in our case breaks the 
        unique name validation. So for now we just add note to the user that the name must be unique 
        issue: https://github.com/react-hook-form/resolvers/issues/538#issuecomment-1504222680
        */}
        </Form>
      </>
    );
  }
);
