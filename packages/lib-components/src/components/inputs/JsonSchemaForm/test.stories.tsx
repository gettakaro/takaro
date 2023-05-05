import React from 'react';
import { StoryFn } from '@storybook/react';
import Form from '@rjsf/core';
import { RJSFSchema } from '@rjsf/utils';
import validator from '@rjsf/validator-ajv8';
import { customFields } from './fields';
import { styled } from '../../../styled';
import { Button } from '../../../components';

const Container = styled.div`
  width: 100%;
`;

export default {
  title: 'Inputs/JsonSchemaForm',
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
      <Form
        schema={schema}
        fields={customFields}
        formData={initialData}
        validator={validator}
      >
        <Button
          type="submit"
          text="Submit"
          onClick={() => console.log('form submitted')}
        />
      </Form>
    </Container>
  );
};
