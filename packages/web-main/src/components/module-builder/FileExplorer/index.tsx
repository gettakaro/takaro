import type { FC } from 'react';
import { ModuleList } from './ModuleList';
import { useModuleBuilderContext } from '../useModuleBuilderStore';

export interface FileExplorerProps {
  autoHiddenFiles?: boolean;
}

export const FileExplorer: FC<FileExplorerProps> = ({ autoHiddenFiles = false }) => {
  const activeFile = useModuleBuilderContext((s) => s.activeFile);
  const openFile = useModuleBuilderContext((s) => s.openFile);
  const visibleFiles = useModuleBuilderContext((s) => s.visibleFiles);
  const files = useModuleBuilderContext((s) => s.fileMap);

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
