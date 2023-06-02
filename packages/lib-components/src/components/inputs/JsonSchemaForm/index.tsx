import Form from '@rjsf/core';
import {
  ErrorListProps,
  FormContextType,
  RJSFSchema,
  UiSchema,
} from '@rjsf/utils';
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

function ErrorListTemplate(_props: ErrorListProps) {
  // This is a stub component, which effectively disables the default error list
  // Otherwise, we have errors displayed twice, once on the field and once on top (this error list)
  return <></>;
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
      templates={{ ErrorListTemplate }}
    >
      {children}
    </Form>
  );
};

export { SchemaGenerator, generateJSONSchema } from './generator';
