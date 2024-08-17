import { FC, useState } from 'react';
import { styled } from '@takaro/lib-components';
import { File } from './File';
import { ModuleList } from './ModuleList';
import { FileExplorerProps } from '.';
import { StudioProps } from '../useStudioStore';

const DirectoryContainer = styled.div`
  position: relative;
  background-color: 'transparent';
`;

export interface DirectoryProps extends FileExplorerProps {
  prefixedPath: string;
  openFile: (path: string) => void;
  activeFile: StudioProps['activeFile'];
  depth: number;
  files: StudioProps['fileMap'];
  visibleFiles: NonNullable<StudioProps['visibleFiles']>;
}

export const Directory: FC<DirectoryProps> = ({
  prefixedPath,
  depth,
  activeFile,
  openFile,
  visibleFiles,
  files,
  autoHiddenFiles,
}) => {
  const [isOpen, setOpen] = useState(
    // if top level folder or if dir has 0 or 1 file, open it by default.
    Object.keys(files).filter((path) => path.includes(prefixedPath)).length >= 1,
  );

  const toggle = (): void => setOpen((prev) => !prev);

  return (
    <>
      <DirectoryContainer key={prefixedPath} role="tree">
        <File depth={depth} isDirOpen={isOpen} onClick={toggle} path={prefixedPath + '/'} />
        {isOpen && (
          <ModuleList
            activeFile={activeFile}
            autoHiddenFiles={autoHiddenFiles}
            depth={depth + 1}
            files={files}
            prefixedPath={prefixedPath}
            openFile={openFile}
            visibleFiles={visibleFiles}
          />
        )}
      </DirectoryContainer>
    </>
  );
};
