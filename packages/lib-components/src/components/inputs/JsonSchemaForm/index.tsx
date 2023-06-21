import { forwardRef, PropsWithChildren } from 'react';
import Form from '@rjsf/core';
import { FormContextType, RJSFSchema, UiSchema } from '@rjsf/utils';
import validator from '@rjsf/validator-ajv8';
import { customFields } from './fields';
import { customWidgets } from './widgets';
import { customTemplates } from './templates';

interface JsonSchemaFormProps {
  schema: RJSFSchema;
  uiSchema: UiSchema;
  formContext?: FormContextType;
  initialData: unknown;
  onChange?: (data: any) => void;
  onSubmit?: any;
  hideSubmitButton?: boolean;
}

export const JsonSchemaForm = forwardRef<
  Form,
  PropsWithChildren<JsonSchemaFormProps>
>(
  (
    {
      schema,
      uiSchema = {},
      initialData,
      formContext,
      onChange,
      onSubmit,
      hideSubmitButton = false,
    },
    ref
  ) => {
    if (hideSubmitButton) {
      uiSchema = {
        ...uiSchema,
        'ui:submitButtonOptions': {
          norender: true,
        },
      };
    }

    return (
      <Form
        schema={schema}
        fields={customFields}
        widgets={customWidgets}
        uiSchema={uiSchema}
        liveValidate={true}
        showErrorList={false}
        formData={initialData}
        validator={validator}
        formContext={formContext}
        templates={customTemplates}
        onChange={onChange}
        onSubmit={onSubmit}
        ref={ref}
      />
    );
  }
);

export { SchemaGenerator } from './generator';
export { inputsToSchema as generateJsonSchema } from './generator/inputsToSchema';
