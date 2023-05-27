import React from 'react';
import { StoryFn } from '@storybook/react';
import { RJSFSchema } from '@rjsf/utils';
import { JsonSchemaForm } from '.';
import { styled } from '../../../styled';
import { Button } from '../../../components';

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
        <Button
          type="submit"
          text="Submit"
          onClick={() => console.log('form submitted')}
        />
      </JsonSchemaForm>
    </Container>
  );
};

export const ModuleTeleports: StoryFn = () => {
  const teleportsSchema: RJSFSchema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    properties: {
      maxTeleports: {
        type: 'integer',
        minimum: 1,
        maximum: 50,
        default: 5,
      },
    },
    required: ['maxTeleports'],
    additionalProperties: false,
  };

  return (
    <Container>
      <JsonSchemaForm
        schema={teleportsSchema}
        initialData={initialData}
        uiSchema={{}}
      >
        <Button
          type="submit"
          text="Submit"
          onClick={() => console.log('form submitted')}
        />
      </JsonSchemaForm>
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
      <JsonSchemaForm
        schema={messagesSchema}
        initialData={initialData}
        uiSchema={{}}
      >
        <Button
          type="submit"
          text="Submit"
          onClick={() => console.log('form submitted')}
        />
      </JsonSchemaForm>
    </Container>
  );
};
