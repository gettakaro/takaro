import Form from '@rjsf/core';
import { FormContextType, RJSFSchema, UiSchema } from '@rjsf/utils';
import validator from '@rjsf/validator-ajv8';
import { FC, PropsWithChildren } from 'react';
import { customFields } from './fields';
import { customWidgets } from './widgets';

interface JsonSchemaFormProps {
  schema: RJSFSchema;
  uiSchema: UiSchema;
  formContext?: FormContextType;
  initialData: unknown;
}

export const JsonSchemaForm: FC<PropsWithChildren<JsonSchemaFormProps>> = ({
  schema,
  uiSchema,
  initialData,
  formContext,
  children,
}) => {
  return (
    <Form
      schema={schema}
      fields={customFields}
      widgets={customWidgets}
      uiSchema={uiSchema}
      formData={initialData}
      validator={validator}
      formContext={formContext}
    >
      {children}
    </Form>
  );
};
