import type { FC } from 'react';
import { ModuleList } from './ModuleList';
import { useStudioContext } from '../useStudioStore';

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
    </>
  );
};
