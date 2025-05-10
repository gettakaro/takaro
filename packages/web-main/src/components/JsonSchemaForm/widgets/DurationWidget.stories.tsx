import { JsonSchemaForm } from '..';
import { styled, Button } from '@takaro/lib-components';
import { InputType } from '../../../routes/_auth/_global/-modules/schemaConversion/inputTypes';
import { SchemaObject } from 'ajv';

const Container = styled.div`
  width: 100%;
  padding: 2rem;
`;

export default {
  title: 'Schema/Widgets/Duration',
};

export const Default = () => {
  const schema: SchemaObject = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    properties: {
      'x-component': InputType.duration,
      duration: {
        type: 'number',
      },
    },
  };

  const uiSchema = {
    duration: {
      'ui:widget': InputType.duration,
    },
  };

  return (
    <Container>
      <JsonSchemaForm schema={schema} initialData={{}} uiSchema={uiSchema}>
        <Button type="submit">Submit</Button>
      </JsonSchemaForm>
    </Container>
  );
};
