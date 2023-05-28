import React, { useState } from 'react';
import { StoryFn } from '@storybook/react';
import { styled } from '../../../../styled';
import { SchemaGenerator } from './index';
import { JsonSchemaForm } from '..';

const LayoutWrapper = styled.div`
  padding: 2rem;
  display: grid;
  grid-template-columns: 1fr 1fr; /* Two equal columns */
  grid-template-rows: 100vh; /* 100% height for the first column */
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
  grid-template-rows: 1fr 1fr; /* Two rows, each taking up half the height */
`;

const Container = styled.div``;

export default {
  title: 'Schema/Generator',
  args: {},
};

export const Default: StoryFn = () => {
  const [schema, setSchema] = useState({});
  return (
    <LayoutWrapper>
      <FirstColumn>
        <h1>Generator</h1>

        <SchemaGenerator onSaveSchema={setSchema} />
      </FirstColumn>
      <SecondColumn>
        <Container>
          <h1>Result schema</h1>
          <pre>{JSON.stringify(schema, null, 2)}</pre>
        </Container>
        <Container>
          <h1>Result form</h1>
          <JsonSchemaForm schema={schema} initialData={{}} uiSchema={{}} />
        </Container>
      </SecondColumn>
    </LayoutWrapper>
  );
};
