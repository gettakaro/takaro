import { FC, Fragment } from 'react';
import { Helmet } from 'react-helmet';
import { styled, CollapseList } from '@takaro/lib-components';
import { Editor } from '../../components/modules/Editor';
import { Resizable } from 're-resizable';
import { FileExplorer } from 'components/modules/FileExplorer';
import { useSandpack } from '@codesandbox/sandpack-react';
import { useModule } from 'hooks/useModule';
import { FunctionType } from 'context/moduleContext';
import { HookConfig } from 'components/modules/Editor/configs/hookConfig';
import { CommandConfig } from 'components/modules/Editor/configs/commandConfig';
import { CronJobConfig } from 'components/modules/Editor/configs/cronjobConfig';

const Container = styled.div`
  display: flex;
`;

const StyledResizable = styled(Resizable)`
  border-right: 2px solid ${({ theme }): string => theme.colors.backgroundAlt};
`;

const Studio: FC = () => {
  const { sandpack } = useSandpack();
  const { moduleData } = useModule();

  function getConfigComponent(type: FunctionType) {
    switch (type) {
      case FunctionType.Hooks:
        return (
          <HookConfig moduleItem={moduleData.fileMap[sandpack.activeFile]} />
        );
      case FunctionType.Commands:
        return (
          <CommandConfig moduleItem={moduleData.fileMap[sandpack.activeFile]} />
        );
      case FunctionType.CronJobs:
        return (
          <CronJobConfig moduleItem={moduleData.fileMap[sandpack.activeFile]} />
        );
      default:
        return null;
    }
  }

  return (
    <Fragment>
      <Helmet>
        <title>Takaro - Studio</title>
      </Helmet>
      <Container>
        <StyledResizable
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
            width: '300px',
            height: '100vh',
          }}
          minWidth="300px"
          maxHeight="100vh"
          minHeight="100vh"
        >
          <CollapseList>
            <CollapseList.Item title="File explorer">
              <FileExplorer sandpack={sandpack} />
            </CollapseList.Item>
            <CollapseList.Item title="Config">
              {getConfigComponent(moduleData.fileMap[sandpack.activeFile].type)}
            </CollapseList.Item>
          </CollapseList>
        </StyledResizable>
        <div style={{ width: '100%' }}>
          <Editor />
        </div>
      </Container>
    </Fragment>
  );
};

export default Studio;
