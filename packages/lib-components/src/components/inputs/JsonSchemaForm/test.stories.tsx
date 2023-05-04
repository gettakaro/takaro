import React, { useState } from 'react';
import { StoryFn } from '@storybook/react';
import { JsonForms } from '@jsonforms/react';
import { vanillaCells, vanillaRenderers } from '@jsonforms/vanilla-renderers';
import { TakaroRenderer } from './renderer';
import { styled } from '../../../styled';

const Container = styled.div`
  width: 100%;
`;

export default {
  title: 'Inputs/JsonSchemaForm',
  args: {},
};

const schema = {
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
const uischema = {
  type: 'VerticalLayout',
  elements: [
    {
      type: 'Control',
      label: false,
      scope: '#/properties/done',
    },
    {
      type: 'Control',
      scope: '#/properties/name',
    },
    {
      type: 'HorizontalLayout',
      elements: [
        {
          type: 'Control',
          scope: '#/properties/due_date',
        },
        {
          type: 'Control',
          scope: '#/properties/recurrence',
        },
      ],
    },
  ],
};
const initialData = {};

export const Default: StoryFn = () => {
  const [data, setData] = useState(initialData);
  return (
    <Container>
      <JsonForms
        schema={schema}
        uischema={uischema}
        data={data}
        renderers={vanillaRenderers}
        cells={vanillaCells}
        onChange={({ data }) => setData(data)}
      />
    </Container>
  );
};

const customRenderSchema = {
  properties: {
    monkey: {
      type: 'string',
      minLength: 1,
    },
    potato: {
      type: 'string',
      minLength: 1,
    },
  },
};

const customRenderUiSchema = {
  type: 'VerticalLayout',
  elements: [
    {
      type: 'Control',
      scope: '#/properties/monkey',
      label: true,
    },
    {
      type: 'Control',
      scope: '#/properties/potato',
      label: true,
    },
  ],
};

export const CustomRenderer = () => {
  const [data, setData] = useState({ monkey: 'aap', potato: 'aardappel' });
  console.log(data);

  return (
    <Container>
      <JsonForms
        schema={customRenderSchema}
        data={data}
        renderers={TakaroRenderer}
        uischema={customRenderUiSchema}
        onChange={({ data, errors }) => {
          console.log('errors', errors);
          setData(data);
        }}
      />
    </Container>
  );
};
