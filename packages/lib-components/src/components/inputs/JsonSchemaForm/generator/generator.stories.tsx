import React, { useState } from 'react';
import { StoryFn } from '@storybook/react';
import { styled } from '../../../../styled';
import { SchemaGenerator } from './index';
import { JsonSchemaForm } from '..';

const Container = styled.div`
  overflow-y: scroll;
  max-height: 100vh;
`;

const LayoutWrapper = styled.div`
  padding: 2rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
`;

const FirstColumn = styled.div`
  grid-column: 1;
  grid-row: 1;
  overflow: scroll;
  padding: 2rem;
`;

const SecondColumn = styled.div`
  grid-column: 2;
  grid-row: 1;
  display: grid;
  grid-template-rows: auto;
`;

export default {
  title: 'Schema/Generator',
  args: {},
};

export const Default: StoryFn = () => {
  const [schema, setSchema] = useState({});
  const [submitData, setSubmitData] = useState({});

  const onSubmit = (data: any) => {
    setSubmitData(data.formData);
  };

  return (
    <Container>
      <LayoutWrapper>
        <FirstColumn>
          <h1>Generator</h1>
          <SchemaGenerator onSchemaChange={setSchema} />
        </FirstColumn>
        <SecondColumn>
          <div>
            <h1>Result schema</h1>
            <pre>{JSON.stringify(schema, null, 2)}</pre>
          </div>
          <div>
            <h1>Result form</h1>
            <JsonSchemaForm
              schema={schema}
              initialData={{}}
              uiSchema={{}}
              onSubmit={onSubmit}
            />
          </div>
          <pre>Form data result: {JSON.stringify(submitData, null, 2)}</pre>
        </SecondColumn>
      </LayoutWrapper>
    </Container>
  );
};
