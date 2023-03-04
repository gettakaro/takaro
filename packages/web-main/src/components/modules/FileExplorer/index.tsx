import { useSandpack } from '@codesandbox/sandpack-react';
import type { FC } from 'react';
import { ModuleList } from './ModuleList';

export interface FileExplorerProps {
  autoHiddenFiles?: boolean;
}

export const FileExplorer: FC<FileExplorerProps> = ({
  autoHiddenFiles = false,
}) => {
  const { sandpack } = useSandpack();

  return (
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
  );
};
