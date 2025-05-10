import { RJSFSchema, UiSchema } from '@rjsf/utils';
import { JsonSchemaForm } from '..';
import { Button } from '@takaro/lib-components';
import { gameServersQueryOptions } from '../../../queries/gameserver';
import { useQuery } from '@tanstack/react-query';

export default {
  title: 'Schema/Widgets/Item',
};

export const Default = () => {
  const fieldId = 'item';
  const { isLoading } = useQuery(gameServersQueryOptions({}));

  const schema: RJSFSchema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    properties: {
      [fieldId]: {
        type: 'string',
        enum: [],
      },
    },
  };

  const uiSchema: UiSchema = {
    [fieldId]: {
      'ui:widget': 'item',
    },
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // todo should wrap this in a route?
  return (
    <JsonSchemaForm schema={schema} initialData={{}} uiSchema={uiSchema}>
      <Button type="submit" onClick={() => console.log('form submitted')}>
        Submit
      </Button>
    </JsonSchemaForm>
  );
};
