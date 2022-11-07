import { FC, Fragment } from 'react';
import { Helmet } from 'react-helmet';
import { styled, Loading, CollapseList } from '@takaro/lib-components';
import { useApiClient } from 'hooks/useApiClient';
import { Editor } from '../../components/modules/Editor';
import { useQuery } from 'react-query';
import {
  ModuleOutputArrayDTOAPI,
  PlayerOutputArrayDTOAPI,
} from '@takaro/apiclient';
import { Resizable } from 're-resizable';
import { FileExplorer } from 'components/modules/FileExplorer';

const Container = styled.div`
  display: flex;
`;

export const Studio: FC = () => {
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
        <title>Takaro - Studio</title>
      </Helmet>
      <Container>
        <Resizable
          enable={{
            top: false,
            topRight: false,
            right: true,
            bottomRight: false,
            bottom: false,
            bottomLeft: false,
            left: false,
            topLeft: false,
          }}
          defaultSize={{
            width: '20%',
            height: '100vh',
          }}
          minWidth="190px"
          maxHeight="100vh"
          minHeight="100vh"
        >
          <CollapseList>
            <CollapseList.Item title="File explorer">
              <FileExplorer />
            </CollapseList.Item>
          </CollapseList>
        </Resizable>
        <Editor />
      </Container>
    </Fragment>
  );
};
