import { RJSFSchema, UiSchema } from '@rjsf/utils';
import { useEffect } from 'react';
import { JsonSchemaForm } from '..';
import { Button } from '@takaro/lib-components';
import { gameServersOptions } from 'queries/gameservers';
import { useQuery } from '@tanstack/react-query';

export default {
  title: 'Schema/Widgets/Item',
};

export const Default = () => {
  const fieldId = 'item';

  const { data, isLoading } = useQuery(gameServersOptions({}));

  useEffect(() => {
    if (data) {
    }
  }, [data]);

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
      <Button type="submit" text="Submit" onClick={() => console.log('form submitted')} />
    </JsonSchemaForm>
  );
};
