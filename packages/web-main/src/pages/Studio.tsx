import { FC, Fragment } from 'react';
import { Helmet } from 'react-helmet';
import { styled, Table, Loading, Button } from '@takaro/lib-components';
import { useApiClient } from 'hooks/useApiClient';
import { useQuery } from 'react-query';
import {
  ModuleOutputArrayDTOAPI,
  PlayerOutputArrayDTOAPI,
} from '@takaro/apiclient';

import * as monaco from 'monaco-editor';
import Editor, { loader } from '@monaco-editor/react';
loader.config({ monaco });

const Container = styled.div`
  display: flex;
`;

const Modules: FC = () => {
  const client = useApiClient();

  const { data, isLoading, refetch } = useQuery<ModuleOutputArrayDTOAPI>(
    'modules',
    async () => (await client.module.moduleControllerSearch()).data
  );

  if (isLoading || data === undefined) {
    return <Loading />;
  }

  return (
    <Fragment>
      <Helmet>
        <title>Modules - Takaro</title>
      </Helmet>

      <Container>
        <Editor
          height="100vh"
          defaultLanguage="javascript"
          defaultValue="// some comment"
          theme='vs-dark'
        />
      </Container>
    </Fragment>
  );
};

export default Modules;
