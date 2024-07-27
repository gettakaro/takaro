import { forwardRef, PropsWithChildren, FormEvent } from 'react';
import Form from '@rjsf/core';
import { FormContextType, RJSFSchema, UiSchema } from '@rjsf/utils';
import validator from '@rjsf/validator-ajv8';
import { customWidgets } from './widgets';
import { customTemplates } from './templates';

interface JsonSchemaFormProps {
  schema: RJSFSchema;
  uiSchema: UiSchema;
  formContext?: FormContextType;
  initialData: unknown;
  onChange?: (data: any) => void;
  onSubmit?: (data: any, event: FormEvent<HTMLFormElement>) => void;
  hideSubmitButton?: boolean;
  readOnly?: boolean;
}

export const JsonSchemaForm = forwardRef<Form, PropsWithChildren<JsonSchemaFormProps>>(
  (
    {
      schema,
      uiSchema,
      initialData,
      formContext,
      onChange,
      onSubmit = () => {},
      hideSubmitButton = false,
      readOnly = false,
    },
    ref,
  ) => {
    if (hideSubmitButton) {
      uiSchema = {
        ...uiSchema,
        'ui:submitButtonOptions': {
          norender: true,
        },
        ...(readOnly ? { 'ui:readonly': true } : {}),
      };
    }

    return (
      <Form
        schema={schema}
        widgets={customWidgets}
        uiSchema={uiSchema}
        // Disable live validation to avoid showing empty field errors when a user is setting up initial module config
        liveValidate={false}
        showErrorList={false}
        formData={initialData}
        validator={validator}
        formContext={formContext}
        templates={customTemplates}
        onChange={onChange}
        onSubmit={onSubmit}
        ref={ref}
        readonly={readOnly}
      />
    );
  },
);
