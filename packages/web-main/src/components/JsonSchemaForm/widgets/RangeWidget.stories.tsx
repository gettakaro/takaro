import React from 'react';
import { RJSFSchema, UiSchema } from '@rjsf/utils';
import { JsonSchemaForm } from '..';
import { styled, Button } from '@takaro/lib-components';

const Container = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 600px;
  padding: 2rem;
`;

export default {
  title: 'Schema/Widgets/Range',
};

export const Default = () => {
  const schema: RJSFSchema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    properties: {
      amount: {
        description: 'This is the description',
        type: 'integer',
        minimum: 1,
        maximum: 50,
        default: 5,
      },
    },
  };

  const uiSchema: UiSchema = {
    amount: {
      'ui:widget': 'slider',
    },
  };

  return (
    <Container>
      <JsonSchemaForm schema={schema} initialData={{}} uiSchema={uiSchema}>
        <Button type="submit" text="Submit" />
      </JsonSchemaForm>
    </Container>
  );
};
