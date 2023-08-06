import { FC, useState } from 'react';
import { styled } from '@takaro/lib-components';
import { SandpackOptions } from '@codesandbox/sandpack-react';
import { File } from './File';
import { ModuleList } from './ModuleList';
import type { SandpackBundlerFiles } from '@codesandbox/sandpack-client';
import { FileExplorerProps } from '.';

const DirectoryContainer = styled.div`
  position: relative;
  background-color: 'transparent';
`;

export interface DirectoryProps extends FileExplorerProps {
  prefixedPath: string;
  selectFile: (path: string) => void;
  activeFile: NonNullable<SandpackOptions['activeFile']>;
  depth: number;
  files: SandpackBundlerFiles;
  visibleFiles: NonNullable<SandpackOptions['visibleFiles']>;
}

export const Directory: FC<DirectoryProps> = ({
  prefixedPath,
  depth,
  activeFile,
  selectFile,
  visibleFiles,
  files,
  autoHiddenFiles,
}) => {
  const [isOpen, setOpen] = useState(
    // if top level folder or if dir has 0 or 1 file, open it by default.
    visibleFiles.filter((path) => path.includes(prefixedPath)).length >= 1
  );

  const toggle = (): void => setOpen((prev) => !prev);

  return (
    <>
      <DirectoryContainer key={prefixedPath} role="tree">
        <File depth={depth} isDirOpen={isOpen} onClick={toggle} filePath={prefixedPath + '/'} />
        {isOpen && (
          <ModuleList
            activeFile={activeFile}
            autoHiddenFiles={autoHiddenFiles}
            depth={depth + 1}
            files={files}
            prefixedPath={prefixedPath}
            selectFile={selectFile}
            visibleFiles={visibleFiles}
          />
        )}
      </DirectoryContainer>
    </>
  );
};
