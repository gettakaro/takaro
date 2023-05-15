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
