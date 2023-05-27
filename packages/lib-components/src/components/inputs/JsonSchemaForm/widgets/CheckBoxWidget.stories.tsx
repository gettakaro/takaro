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
  title: 'Schema/Widgets/Checkbox',
};

export const Default = () => {
  const schema: RJSFSchema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    properties: {
      isValid: {
        type: 'boolean',
        default: false,
        description: 'Is the underlying thing valid?',
        title: 'Is valid?',
      },
    },
  };

  const uiSchema: UiSchema = {
    isValid: {
      'ui:widget': 'checkbox',
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
