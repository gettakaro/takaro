import { RJSFSchema } from '@rjsf/utils';
import { JsonSchemaForm } from '..';
import { styled, Button } from '@takaro/lib-components';

const Container = styled.div`
  width: 100%;
  padding: 2rem;
`;

export default {
  title: 'Schema/Widgets/Select',
};

export const Default = () => {
  const schema: RJSFSchema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    properties: {
      type: {
        type: 'string',
        enum: ['7 Days to Die', 'Rust', 'Mock'],
      },
    },
  };

  return (
    <Container>
      <JsonSchemaForm schema={schema} initialData={{}} uiSchema={{}}>
        <Button type="submit">Submit</Button>
      </JsonSchemaForm>
    </Container>
  );
};

export const MultiSelect = () => {
  const schema: RJSFSchema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    properties: {
      field: {
        type: 'array',
        items: {
          type: 'string',
          enum: ['a', 'b', 'c'],
        },
        uniqueItems: true,
      },
    },
  };
  return (
    <Container>
      <JsonSchemaForm schema={schema} initialData={{}} uiSchema={{}}>
        <Button type="submit">Submit</Button>
      </JsonSchemaForm>
    </Container>
  );
};
