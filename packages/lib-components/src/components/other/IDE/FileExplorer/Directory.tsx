import { FC, useState } from 'react';
import type { SandpackOptions } from '@codesandbox/sandpack-react';
import { File } from './File';
import { ModuleList } from './ModuleList';
import type { SandpackBundlerFiles } from '@codesandbox/sandpack-client';
import { FileExplorerProps } from '.';


export interface DirectoryProps extends FileExplorerProps {
  prefixedPath: string;
  selectFile: (path: string) => void;
  activeFile: NonNullable<SandpackOptions['activeFile']>
  depth: number;
  files: SandpackBundlerFiles
  visibleFiles: NonNullable<SandpackOptions['visibleFiles']>;
}

export const Directory: FC<DirectoryProps> = ({ prefixedPath, depth, activeFile, selectFile, visibleFiles, files, autoHiddenFiles }) => {

  const [open, setOpen] = useState(true);
  const toggle = (): void => setOpen((prev) => !prev);

  return (
    <div key={prefixedPath}>
      <File 
        depth={depth}
        isDirOpen={open}
        onClick={toggle}
        path={prefixedPath + '/'}
      />
        { open && (
          <ModuleList
            activeFile={activeFile}
            autoHiddenFiles={autoHiddenFiles}
            depth={depth+1}
            files={files}
            prefixedPath={prefixedPath}
            selectFile={selectFile}
            visibleFiles={visibleFiles}
          />
        )}
    </div>
  );
};

