import { Dispatch, FC, SetStateAction, useRef, useState } from 'react';
import { styled, Tooltip, useTheme, Dialog, Button, ContextMenu } from '@takaro/lib-components';
import { calculateNearestUniquePath, getFileName } from './utils';
import { DiJsBadge as JsIcon } from 'react-icons/di';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useModuleBuilderContext } from '../useModuleBuilderStore';

const closeIcon =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNOS40MjggOEwxMiAxMC41NzMgMTAuNTcyIDEyIDggOS40MjggNS40MjggMTIgNCAxMC41NzMgNi41NzIgOCA0IDUuNDI4IDUuNDI3IDQgOCA2LjU3MiAxMC41NzMgNCAxMiA1LjQyOCA5LjQyOCA4eiIgZmlsbD0iIzQyNDI0MiIvPjwvc3ZnPg==';
const dirtyIcon =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNiAxNiIgZW5hYmxlLWJhY2tncm91bmQ9Im5ldyAwIDAgMTYgMTYiIGhlaWdodD0iMTYiIHdpZHRoPSIxNiI+PGNpcmNsZSBmaWxsPSIjQzVDNUM1IiBjeD0iOCIgY3k9IjgiIHI9IjQiLz48L3N2Zz4=';

const Tabs = styled.div`
  border-bottom: '1px solid ${({ theme }) => theme.colors.background}';
  background: ${({ theme }) => theme.colors.background};
`;

const ScrollableContainer = styled.div`
  overflow: auto;
  display: flex;
  flex-wrap: nowrap;
  align-items: stretch;
  min-height: 40px;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[1]};
  justify-content: space-between;
  width: 100%;
`;

export const CloseIcon = styled.div<{ isActive: boolean; isDirty: boolean }>`
  margin-left: ${({ theme }) => theme.spacing['0_75']};
  cursor: pointer;
  visibility: ${({ isActive, isDirty }) => (isActive || isDirty ? 'visible' : 'hidden')};
  width: 16px;
  height: 16px;
  background: ${({ isDirty }) => (isDirty ? `url(${dirtyIcon}) 50% no-repeat` : `url(${closeIcon}) 50% no-repeat`)};
`;

export const TabButton = styled.button<{ isActive: boolean }>`
  padding: ${({ theme }) => `0 ${theme.spacing[1]}`};
  white-space: nowrap;
  display: flex;
  align-items: center;
  border-radius: 0;
  background-color: ${({ theme }) => theme.colors.background};
  ${({ isActive, theme }) => isActive && `border-bottom: 1px solid ${theme.colors.primary};`};
  min-width: fit-content;
  width: 80px;
  font-size: ${({ theme }) => theme.fontSize.small};
  color: ${({ theme, isActive }) => (isActive ? theme.colors.white : theme.colors.text)};

  span {
    margin-left: ${({ theme }) => theme.spacing['0_75']};
    margin-right: ${({ theme }) => theme.spacing[1]};
  }

  &:hover {
    ${CloseIcon} {
      visibility: visible;
      background: url(${closeIcon}) 50% no-repeat;
    }
  }
`;

export interface FileTabsProps {
  closableTabs?: boolean;
  dirtyFiles: Set<string>;
  setDirtyFiles: Dispatch<SetStateAction<Set<string>>>;
}

export const FileTabs: FC<FileTabsProps> = ({ closableTabs, dirtyFiles, setDirtyFiles }) => {
  const activeFile = useModuleBuilderContext((s) => s.activeFile);
  const setActiveFile = useModuleBuilderContext((s) => s.setActiveFile);
  const visibleFiles = useModuleBuilderContext((s) => s.visibleFiles);

  const moveTab = (_filePath: string, _atIndex: number) => {
    /* TODO */
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <Tabs translate="no">
        <ScrollableContainer aria-label="Select active file" role="tablist">
          {visibleFiles.map((filePath, index) => (
            <Tab
              key={filePath}
              filePath={filePath}
              isActive={filePath === activeFile}
              isDirty={dirtyFiles.has(filePath) ?? false}
              onClick={() => setActiveFile(filePath)}
              dirtyFiles={dirtyFiles}
              setDirtyFiles={setDirtyFiles}
              closableTabs={closableTabs}
              moveTab={moveTab}
              index={index}
            />
          ))}
        </ScrollableContainer>
      </Tabs>
    </DndProvider>
  );
};

interface TabProps {
  filePath: string;
  isActive: boolean;
  isDirty: boolean;
  onClick: () => void;
  dirtyFiles: Set<string>;
  setDirtyFiles: Dispatch<SetStateAction<Set<string>>>;
  closableTabs?: boolean;
  moveTab: (filePath: string, atIndex: number) => void;
  index: number;
}

const DND_ITEM_TYPE = 'tab';

const Tab: FC<TabProps> = ({
  filePath,
  isActive,
  isDirty,
  setDirtyFiles,
  dirtyFiles,
  closableTabs,
  moveTab,
  index,
}) => {
  const setActiveFile = useModuleBuilderContext((s) => s.setActiveFile);
  const visibleFiles = useModuleBuilderContext((s) => s.visibleFiles);
  const closeFile = useModuleBuilderContext((s) => s.closeFile);
  const activeFile = useModuleBuilderContext((s) => s.activeFile);

  const theme = useTheme();
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const tabRef = useRef<HTMLButtonElement | null>(null);
  const originalIndex = useRef(index);

  const [, drag] = useDrag({
    type: DND_ITEM_TYPE,
    item: { filePath, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (_item, monitor) => {
      const { filePath: droppedId } = monitor.getItem();
      const didDrop = monitor.didDrop();
      if (!didDrop) {
        moveTab(droppedId, originalIndex.current);
      }
    },
  });

  const [, drop] = useDrop({
    accept: DND_ITEM_TYPE,
    canDrop: () => false,
    /*hover({ filePath: draggedId, index: overIndex }) {
      if (draggedId !== filePath) {
        moveTab(draggedId, overIndex);
        originalIndex.current = overIndex;
      }
    },
    */
  });

  const getTriggerText = (currentPath: string): string => {
    const documentFileName = getFileName(currentPath);

    const pathsWithDuplicateFileNames = visibleFiles.reduce((prev, curr) => {
      if (curr === currentPath) {
        return prev;
      }

      const fileName = getFileName(curr);

      if (fileName === documentFileName) {
        prev.push(curr);
        return prev;
      }

      return prev;
    }, [] as string[]);

    if (pathsWithDuplicateFileNames.length === 0) {
      return documentFileName;
    }
    return calculateNearestUniquePath(currentPath, pathsWithDuplicateFileNames);
  };

  const handleDiscardAndClose = (filePath: string): void => {
    setDirtyFiles((prev) => {
      const newDirtyFiles = new Set(prev);
      newDirtyFiles.delete(filePath);
      return newDirtyFiles;
    });

    closeFile(filePath);
  };

  const handleCloseSaved = () => {
    const saved = visibleFiles.filter((filePath) => {
      return !dirtyFiles.has(filePath);
    });
    saved.forEach((filePath) => closeFile(filePath));
  };

  const handleCloseAllRight = () => {
    const right = visibleFiles.slice(visibleFiles.indexOf(filePath) + 1);
    right.forEach((filePath) => closeFile(filePath));
  };

  const handleCloseSingleRight = () => {
    const right = visibleFiles.slice(visibleFiles.indexOf(filePath) + 1);

    // if there is no file to the right, return
    if (right.length === 0) return;

    closeFile(right[0]);
  };

  const handleTryClose = (filePath: string) => {
    if (dirtyFiles.has(filePath)) {
      setOpenDialog(true);
      return;
    }
    closeFile(filePath);
  };

  /* TODO: see comment below (closeAll)
  const handleCloseAll = () => {
    visibleFiles.forEach((filePath) => closeFile(filePath));
  };
  */

  // close all files except the active one
  const handleCloseOthers = () => {
    visibleFiles.forEach((filePath) => {
      if (filePath !== activeFile) {
        closeFile(filePath);
      }
    });
  };

  return (
    <>
      <TabButton
        key={filePath}
        aria-selected={isActive}
        isActive={isActive}
        onClick={(): void => setActiveFile(filePath)}
        role="tab"
        title={filePath}
        type="button"
        ref={(el) => {
          drag(drop(el));
          tabRef.current = el;
        }}
      >
        <JsIcon size={11} style={{ fill: theme.colors.secondary }} />
        <span>{getTriggerText(filePath)}</span>
        {closableTabs && (
          <Tooltip>
            <Tooltip.Trigger asChild>
              <CloseIcon
                data-testid={`close-${getFileName(filePath)}-${isDirty ? 'dirty' : 'clean'}`}
                isDirty={isDirty}
                isActive={isActive}
                onClick={(e) => {
                  e.stopPropagation();
                  handleTryClose(filePath);
                }}
              />
            </Tooltip.Trigger>
            <Tooltip.Content>Close {getFileName(filePath)}</Tooltip.Content>
          </Tooltip>
        )}
      </TabButton>

      {/* Discard unsaved changes dialog*/}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <Dialog.Content>
          <Dialog.Heading>
            Unsaved changes: <strong>{getFileName(filePath)}</strong>
          </Dialog.Heading>
          <Dialog.Body>
            <p>
              You have unsaved changes in <strong>{getFileName(filePath)}</strong> file. <br />
              Are you sure you want to continue without saving?
            </p>
            <ButtonContainer>
              <Button type="button" color="error" fullWidth onClick={() => handleDiscardAndClose(filePath)}>
                Discard changes
              </Button>
            </ButtonContainer>
          </Dialog.Body>
        </Dialog.Content>
      </Dialog>

      {/* Context menu */}
      <ContextMenu targetRef={tabRef}>
        <ContextMenu.Group divider>
          <ContextMenu.Item
            label="Close"
            onClick={() => {
              if (dirtyFiles.has(filePath)) {
                setOpenDialog(true);
                return;
              }
              closeFile(filePath);
            }}
          />
          <ContextMenu.Item label="Close to right" onClick={handleCloseSingleRight} />
          <ContextMenu.Item label="Close all to right" onClick={handleCloseAllRight} />
          <ContextMenu.Item label="Close saved" onClick={handleCloseSaved} />
          <ContextMenu.Item label="Close others" onClick={handleCloseOthers} />
          {/* TODO: closing all files breaks the editor */}
          {/* <ContextMenu.Item label="Close all" onClick={handleCloseAll} /> */}
        </ContextMenu.Group>
        {/* TODO: split editor into multiple views */}
      </ContextMenu>
    </>
  );
};
