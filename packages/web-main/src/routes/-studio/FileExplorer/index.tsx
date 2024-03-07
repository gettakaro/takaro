import type { FC } from 'react';
import { ModuleList } from './ModuleList';
import { useStudioContext } from '../useStudioStore';
import { Alert } from '@takaro/lib-components';

export interface FileExplorerProps {
  autoHiddenFiles?: boolean;
}

export const FileExplorer: FC<FileExplorerProps> = ({ autoHiddenFiles = false }) => {
  const activeFile = useStudioContext((s) => s.activeFile);
  const openFile = useStudioContext((s) => s.openFile);
  const visibleFiles = useStudioContext((s) => s.visibleFiles);
  const files = useStudioContext((s) => s.fileMap);

  return (
    <>
      <ModuleList
        activeFile={activeFile}
        files={files}
        prefixedPath="/"
        autoHiddenFiles={autoHiddenFiles}
        openFile={openFile}
        visibleFiles={visibleFiles}
      />
      <Alert
        variant="info"
        text="Despite the appearance of directory-based structure in file explorers, all files actually reside at the root level. Consequently, when importing a file, you should always use './file' instead of './directory/file'."
      />
    </>
  );
};
