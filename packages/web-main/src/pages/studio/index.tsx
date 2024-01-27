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

const EventsWrapper = styled.div`
  padding-right: ${({ theme }) => theme.spacing[1]};
`;

const Wrapper = styled.div`
  padding: ${({ theme }) => `${theme.spacing[1]} ${theme.spacing[2]} ${theme.spacing[2]} 0`};
`;

const Content = styled.div`
  display: flex;
  /* calculates the remaining height of the screen minus the header and the padding */
  height: calc(calc(100vh - 39px) - 1.2rem);
`;

const StyledResizable = styled(Resizable)`
  height: 100%;
  padding: 0 ${({ theme }) => theme.spacing[1]};
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
      <Content>
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
            height: '100%',
          }}
          minWidth="500px"
          maxHeight="100%"
          minHeight="0"
        >
          <CollapseList>
            <CollapseList.Item title="File explorer">
              <FileExplorer sandpack={sandpack} />
            </CollapseList.Item>
            <CollapseList.Item title={configMap[activeModule.type]}>
              {getConfigComponent(activeModule.type)}
            </CollapseList.Item>
            <CollapseList.Item title={'Last executions'}>
              <EventsWrapper>
                <EventFeedWidget query={{ filters: { moduleId: [moduleData.id] } }} />
              </EventsWrapper>
            </CollapseList.Item>
          </CollapseList>
        </StyledResizable>
        <Editor readOnly={moduleData.isBuiltIn} />
      </Content>
    </Wrapper>
  );
};

export default Studio;
