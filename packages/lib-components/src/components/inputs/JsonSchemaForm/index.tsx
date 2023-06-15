import Form from '@rjsf/core';
import { FormContextType, RJSFSchema, UiSchema } from '@rjsf/utils';
import validator from '@rjsf/validator-ajv8';
import { FC, Fragment, PropsWithChildren } from 'react';
import { customFields } from './fields';
import { customWidgets } from './widgets';
import { customTemplates } from './templates';

interface JsonSchemaFormProps {
  schema: RJSFSchema;
  uiSchema: UiSchema;
  formContext?: FormContextType;
  initialData: unknown;
  onChange?: (data: unknown) => void;
}

export const JsonSchemaForm: FC<PropsWithChildren<JsonSchemaFormProps>> = ({
  schema,
  uiSchema,
  initialData,
  formContext,
  onChange,
}) => {
  return (
    <Form
      schema={schema}
      fields={customFields}
      widgets={customWidgets}
      uiSchema={uiSchema}
      showErrorList={false}
      formData={initialData}
      validator={validator}
      formContext={formContext}
      templates={customTemplates}
      onChange={onChange}
    >
      <Fragment />
    </Form>
  );
};

export { SchemaGenerator, generateJSONSchema } from './generator';
