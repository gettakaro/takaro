import { RJSFSchema, UiSchema } from '@rjsf/utils';
import { JsonSchemaForm } from '..';
import { styled, Button } from '@takaro/lib-components';

const Container = styled.div`
  width: 100%;
  padding: 2rem;
`;

export default {
  title: 'Schema/Widgets/Radio',
};

export const Default = () => {
  const schema: RJSFSchema = {
    type: 'object',
    properties: {
      recurrence: {
        description: 'This is the description',
        type: 'string',
        enum: ['Never', 'Daily', 'Weekly', 'Monthly'],
      },
    },
  };

  const uiSchema: UiSchema = {
    recurrence: {
      'ui:widget': 'radioWidget',
    },
  };

  return (
    <Container>
      <JsonSchemaForm schema={schema} initialData={{}} uiSchema={uiSchema}>
        <Button type="submit" onClick={() => console.log('form submitted')}>
          Submit
        </Button>
      </JsonSchemaForm>
    </Container>
  );
};
