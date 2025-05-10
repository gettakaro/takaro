import { RJSFSchema } from '@rjsf/utils';
import { JsonSchemaForm } from '..';
import { styled, Button } from '@takaro/lib-components';
import { useState } from 'react';

const Container = styled.div`
  width: 100%;
  padding: 2rem;
`;

export default {
  title: 'Schema/Widgets/Checkbox',
};

export const Default = () => {
  const [result, setResult] = useState<boolean>(false);

  const schema: RJSFSchema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    properties: {
      isValid: {
        type: 'boolean',
        default: false,
        description: 'This is the description',
        title: 'Is valid?',
      },
    },
  };

  const onSubmit = (data: { isValid: boolean }) => {
    setResult(data.isValid);
  };

  return (
    <Container>
      <JsonSchemaForm schema={schema} initialData={{}} uiSchema={{}} onSubmit={onSubmit}>
        <Button type="submit" onClick={() => console.log('form submitted')}>
          Submit
        </Button>
      </JsonSchemaForm>
      <pre>result: {result}</pre>
    </Container>
  );
};
