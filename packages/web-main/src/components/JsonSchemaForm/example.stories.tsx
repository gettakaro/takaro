import { useRef, useState } from 'react';
import { StoryFn } from '@storybook/react';
import { RJSFSchema } from '@rjsf/utils';
import Form from '@rjsf/core';
import { JsonSchemaForm } from './index';
import { Button, styled } from '@takaro/lib-components';
import { InputType } from '../../routes/_auth/_global/-modules/schemaConversion/inputTypes';

const Container = styled.div`
  width: 100%;
  padding: 2rem;
`;

export default {
  title: 'Schema/Example',
  args: {},
};

const schema: RJSFSchema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minLength: 1,
    },
    done: {
      type: 'boolean',
    },
    due_date: {
      type: 'string',
      format: 'date',
    },
    recurrence: {
      type: 'string',
      enum: ['Never', 'Daily', 'Weekly', 'Monthly'],
    },
  },
  required: ['name', 'due_date'],
};

const initialData = {};

export const Default: StoryFn = () => {
  return (
    <Container>
      <JsonSchemaForm schema={schema} initialData={initialData} uiSchema={{}}>
        <Button type="submit" text="Submit" onClick={() => console.log('form submitted')} />
      </JsonSchemaForm>
    </Container>
  );
};

export const SubmitProgrammatically: StoryFn = () => {
  const [data, setData] = useState({});

  const teleportsSchema: RJSFSchema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    properties: {
      maxTeleports: {
        type: InputType.number,
        minimum: 1,
        maximum: 50,
        default: 5,
      },
    },
    required: ['maxTeleports'],
    additionalProperties: false,
  };

  const onSubmit = ({ formData }, e) => {
    e.preventDefault();
    setData(formData);
  };

  const formRef = useRef<Form>(null);

  return (
    <Container>
      <JsonSchemaForm
        schema={teleportsSchema}
        initialData={initialData}
        uiSchema={{}}
        ref={formRef}
        hideSubmitButton
        onSubmit={onSubmit}
      />
      <p>This button is a default button outside of the form, since we have to trigger the submit somehow</p>
      <Button type="button" text="Programmatically submit form" onClick={() => formRef.current?.submit()} />
      <pre>result: {JSON.stringify(data, null, 2)}</pre>
    </Container>
  );
};

export const ModuleServerMessages: StoryFn = () => {
  const messagesSchema: RJSFSchema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    properties: {
      messages: {
        type: 'array',
        default: [
          // prettier-ignore
          'This is an automated message, don\'t forget to read the server rules!',
        ],
        items: {
          type: 'string',
          minLength: 5,
          maxLength: 1024,
        },
        minItems: 1,
      },
    },
    required: ['messages'],
  };

  return (
    <Container>
      <JsonSchemaForm schema={messagesSchema} initialData={initialData} uiSchema={{}}>
        <Button type="submit" text="Submit" onClick={() => console.log('form submitted')} />
      </JsonSchemaForm>
    </Container>
  );
};
