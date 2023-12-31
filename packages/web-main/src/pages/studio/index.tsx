import { FC } from 'react';
import { styled, CollapseList } from '@takaro/lib-components';
import { Editor } from './Editor';
import { Resizable } from 're-resizable';
import { FileExplorer } from './FileExplorer';
import { useSandpack } from '@codesandbox/sandpack-react';
import { useModule } from 'hooks/useModule';
import { FunctionType } from 'context/moduleContext';
import { CronJobConfig, CommandConfig, HookConfig } from './Editor/configs';
import { Header } from './Header';
import { useDocumentTitle } from 'hooks/useDocumentTitle';
import { EventFeedWidget } from 'components/events/EventFeedWidget';

const Wrapper = styled.div`
  padding: ${({ theme }) => `${theme.spacing[1]} ${theme.spacing[2]}} ${theme.spacing[2]} 0`};
`;

const Container = styled.div`
  display: flex;
`;

const ConfigWrapper = styled.div`
  padding: ${({ theme }) => theme.spacing[1]};
`;

const StyledResizable = styled(Resizable)`
  border-right: 2px solid ${({ theme }): string => theme.colors.background};
  border-top-right-radius: ${({ theme }) => theme.borderRadius.medium};

  &:hover {
    border-right: 2px solid ${({ theme }): string => theme.colors.backgroundAlt};
  }
`;

const Studio: FC = () => {
  useDocumentTitle('Studio');
  const { sandpack } = useSandpack();
  const { moduleData } = useModule();

  const activeModule = moduleData.fileMap[sandpack.activeFile];

  if (!activeModule) return null;

  function getConfigComponent(type: FunctionType) {
    switch (type) {
      case FunctionType.Hooks:
        return <HookConfig moduleItem={activeModule} readOnly={moduleData.isBuiltIn} />;
      case FunctionType.Commands:
        return <CommandConfig moduleItem={activeModule} readOnly={moduleData.isBuiltIn} />;
      case FunctionType.CronJobs:
        return <CronJobConfig moduleItem={activeModule} readOnly={moduleData.isBuiltIn} />;
      default:
        return null;
    }
  }

  const configMap = {
    [FunctionType.Hooks]: 'Hook Config',
    [FunctionType.Commands]: 'Command Config',
    [FunctionType.CronJobs]: 'CronJob Config',
  } as const;

  return (
    <Wrapper>
      <Header />
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
            <CollapseList.Item title={configMap[activeModule.type]}>
              <ConfigWrapper>{getConfigComponent(activeModule.type)}</ConfigWrapper>
            </CollapseList.Item>
            <CollapseList.Item title={'Last executions'}>
              <ConfigWrapper>
                <EventFeedWidget query={{ filters: { moduleId: [moduleData.id] } }} />
              </ConfigWrapper>
            </CollapseList.Item>
          </CollapseList>
        </StyledResizable>
        <Editor readOnly={moduleData.isBuiltIn} />
      </Container>
    </Wrapper>
  );
};

export default Studio;
