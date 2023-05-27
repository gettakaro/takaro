import { RJSFSchema, UiSchema } from '@rjsf/utils';
import React from 'react';
import { JsonSchemaForm } from '..';
import { styled } from '../../../../styled';
import { Button } from '../../../actions';

const Container = styled.div`
  width: 100%;
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
        <Button
          type="submit"
          text="Submit"
          onClick={() => console.log('form submitted')}
        />
      </JsonSchemaForm>
    </Container>
  );
};
