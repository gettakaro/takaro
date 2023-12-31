import { FC } from 'react';
import type { SandpackBundlerFiles } from '@codesandbox/sandpack-client';
import type { SandpackOptions } from '@codesandbox/sandpack-react';
import { fromPropsToModules } from './utils';
import { FileExplorerProps } from '.';
import { Directory } from './Directory';
import { File } from './File';

export interface ModuleListProps extends FileExplorerProps {
  prefixedPath: string;
  files: SandpackBundlerFiles;
  selectFile: (path: string) => void;
  depth?: number;
  visibleFiles: NonNullable<SandpackOptions['visibleFiles']>;
  activeFile: NonNullable<SandpackOptions['activeFile']>;
}

export const ModuleList: FC<ModuleListProps> = ({
  depth = 0,
  activeFile,
  selectFile,
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
          selectFile={selectFile}
          visibleFiles={visibleFiles}
        />
      ))}

      {modules.map((file) => {
        return <File key={file} active={activeFile === file} depth={depth} filePath={file} selectFile={selectFile} />;
      })}
    </>
  );
};
