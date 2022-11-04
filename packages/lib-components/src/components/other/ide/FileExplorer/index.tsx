import { useSandpack } from '@codesandbox/sandpack-react';
import type { FC } from 'react';
import { ModuleList } from './ModuleList';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

export interface FileExplorerProps {
  autoHiddenFiles?: boolean;
}

export const FileExplorer: FC<FileExplorerProps> = ({
  autoHiddenFiles = false,
}) => {
  const { sandpack } = useSandpack();

  return (
    <DndProvider backend={HTML5Backend}>
      <div>
        <ModuleList
          activeFile={sandpack.activeFile}
          files={sandpack.files}
          prefixedPath="/"
          autoHiddenFiles={autoHiddenFiles}
          selectFile={sandpack.openFile}
          visibleFiles={sandpack.visibleFilesFromProps}
        />
      </div>
    </DndProvider>
  );
};
