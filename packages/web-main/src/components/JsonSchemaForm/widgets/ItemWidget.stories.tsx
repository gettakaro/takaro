import { RJSFSchema, UiSchema } from '@rjsf/utils';
import React, { useEffect } from 'react';
import { JsonSchemaForm } from '..';
import { Button } from '@takaro/lib-components';
import { SelectedGameServerContext } from 'context/selectedGameServerContext';
import { useGameServers } from 'queries/gameservers';

export default {
  title: 'Schema/Widgets/Item',
};

export const Default = () => {
  const fieldId = 'item';

  const { data, isLoading } = useGameServers();
  const [selectedGameServerId, setSelectedGameServerId] = React.useState<string>();

  useEffect(() => {
    if (data) {
      setSelectedGameServerId(data.pages[0].data[0].id);
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

  return (
    <SelectedGameServerContext.Provider
      value={{ selectedGameServerId: selectedGameServerId!, setSelectedGameServerId }}
    >
      <JsonSchemaForm schema={schema} initialData={{}} uiSchema={uiSchema}>
        <Button type="submit" text="Submit" onClick={() => console.log('form submitted')} />
      </JsonSchemaForm>
    </SelectedGameServerContext.Provider>
  );
};
