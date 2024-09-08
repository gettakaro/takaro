import { FC } from 'react';
import { fromPropsToModules } from './utils';
import { FileExplorerProps } from '.';
import { Directory } from './Directory';
import { File } from './File';
import { ModuleBuilderProps } from '../useModuleBuilderStore';

export interface ModuleListProps extends FileExplorerProps {
  prefixedPath: string;
  files: ModuleBuilderProps['fileMap'];
  openFile: (path: string) => void;
  depth?: number;
  visibleFiles: ModuleBuilderProps['visibleFiles'];
  activeFile: ModuleBuilderProps['activeFile'];
}

export const ModuleList: FC<ModuleListProps> = ({
  depth = 0,
  activeFile,
  openFile,
  prefixedPath,
  files,
  autoHiddenFiles,
  visibleFiles,
}) => {
  const { directories, modules } = fromPropsToModules({
    visibleFiles,
    autoHiddenFiles,
    prefixedPath,
    files,
    depth,
  });

  return (
    <>
      {directories.map((dir) => (
        <Directory
          key={dir}
          activeFile={activeFile}
          autoHiddenFiles={autoHiddenFiles}
          depth={depth}
          files={files}
          prefixedPath={dir}
          openFile={openFile}
          visibleFiles={modules}
        />
      ))}

      {modules.map((file) => {
        return <File key={file} active={activeFile === file} depth={depth} path={file} openFile={openFile} />;
      })}
    </>
  );
};
