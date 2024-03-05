import { FC } from 'react';
import { styled, CollapseList } from '@takaro/lib-components';
import { Editor } from './Editor';
import { Resizable } from 're-resizable';
import { FileExplorer } from './FileExplorer';
import { CronJobConfig, CommandConfig, HookConfig } from './Editor/configs';
import { Header } from './Header';
import { useDocumentTitle } from 'hooks/useDocumentTitle';
import { EventFeedWidget } from 'components/events/EventFeedWidget';
import { ErrorBoundary } from 'components/ErrorBoundary';
import { FileType, useStudioContext } from './useStudioStore';

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

export const StudioInner: FC = () => {
  useDocumentTitle('Studio');
  const readOnly = useStudioContext((s) => s.readOnly);
  const activeFilePath = useStudioContext((s) => s.activeFile);
  const files = useStudioContext((s) => s.fileMap);
  const moduleId = useStudioContext((s) => s.moduleId);
  const activeFile = activeFilePath ? files[activeFilePath] : null;

  function getConfigComponent(type: FileType, itemId: string) {
    switch (type) {
      case FileType.Hooks:
        return <HookConfig itemId={itemId} readOnly={readOnly} />;
      case FileType.Commands:
        return <CommandConfig itemId={itemId} readOnly={readOnly} />;
      case FileType.CronJobs:
        return <CronJobConfig itemId={itemId} readOnly={readOnly} />;
      default:
        return null;
    }
  }

  const configTitleMap = {
    [FileType.Hooks]: 'Hook Config',
    [FileType.Commands]: 'Command Config',
    [FileType.CronJobs]: 'CronJob Config',
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
              <ErrorBoundary>
                <FileExplorer />
              </ErrorBoundary>
            </CollapseList.Item>
            {activeFile && (
              <>
                <CollapseList.Item title={configTitleMap[activeFile.type]}>
                  <ErrorBoundary>{getConfigComponent(activeFile.type, activeFile.itemId)}</ErrorBoundary>
                </CollapseList.Item>
                <CollapseList.Item title={'Last executions'}>
                  <ErrorBoundary>
                    <EventsWrapper>
                      <EventFeedWidget query={{ filters: { moduleId: [moduleId] } }} />
                    </EventsWrapper>
                  </ErrorBoundary>
                </CollapseList.Item>
              </>
            )}
          </CollapseList>
        </StyledResizable>
        {/* TODO: provide placeholder */}
        {activeFile && <Editor readOnly={readOnly} />}
      </Content>
    </Wrapper>
  );
};
