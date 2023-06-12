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

  const activeModule = moduleData.fileMap[sandpack.activeFile];

  function getConfigComponent(type: FunctionType) {
    switch (type) {
      case FunctionType.Hooks:
        return <HookConfig moduleItem={activeModule} />;
      case FunctionType.Commands:
        return <CommandConfig moduleItem={activeModule} />;
      case FunctionType.CronJobs:
        return <CronJobConfig moduleItem={activeModule} />;
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
          minWidth="500px"
          maxHeight="100vh"
          minHeight="100vh"
        >
          <CollapseList>
            <CollapseList.Item title="File explorer">
              <FileExplorer sandpack={sandpack} />
            </CollapseList.Item>
            <CollapseList.Item title="Config">
              {getConfigComponent(activeModule.type)}
            </CollapseList.Item>
          </CollapseList>
        </StyledResizable>
        <Editor />
      </Container>
    </Fragment>
  );
};

export default Studio;
