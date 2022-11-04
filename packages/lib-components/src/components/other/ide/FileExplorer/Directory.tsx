import { FC, useEffect, useRef, useState } from 'react';
import { styled } from '../../../../styled';
import { SandpackOptions } from '@codesandbox/sandpack-react';
import { File } from './File';
import { ModuleList } from './ModuleList';
import type { SandpackBundlerFiles } from '@codesandbox/sandpack-client';
import { FileExplorerProps } from '.';
import { useDrop } from 'react-dnd';
import { ItemTypes } from './ItemTypes';
import { canRename, getFileName } from './utils';
import { lighten } from 'polished';

const DirectoryContainer = styled.div<{ isOver: boolean; canDrop: boolean }>`
  position: relative;
  ${({ isOver, canDrop }) => {
    if (isOver && !canDrop) {
      return 'cursor: not-allowed';
    }
    if (!isOver && canDrop) {
      return 'background-color: transparent;';
    }
    if (isOver && canDrop) {
      return `background-color: ${lighten(0.9, '#000')}`;
    }
    return 'background-color: transparent;';
  }};
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
    depth == 0 ||
      visibleFiles.filter((path) => path.includes(prefixedPath)).length <= 1
  );

  const timer = useRef<number>(0);
  const toggle = (): void => setOpen((prev) => !prev);

  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept: ItemTypes.FILE,
      drop: (item: { path: string }) => {
        if (canRename(item.path, prefixedPath)) {
          // prefix path is the directoy we want to drop it into
          // item.path is the current file_path (

          console.log('current item', item.path);
          console.log(
            `prefix path is the directoy we want to drop it into: ${prefixedPath}`
          );
          const listOfPaths = Object.keys(files)
            .filter((path: string) => path.includes(prefixedPath))
            .filter((path) => path.includes(getFileName(item.path)));

          // normally the list of paths should only contain a single item (i think)

          /*if (listOfPaths.find((path) => path === item.path)) {
            enqueueSnackbar('File with that name already exists.', {
              variant: 'default',
            });
          }
        */
          console.log('ffffffffffffff', listOfPaths);
        }
      },
      canDrop: (item: { path: string }) => canRename(item.path, prefixedPath),
      collect: (monitor) => ({
        isOver: !!monitor.isOver({ shallow: true }),
        canDrop: !!monitor.canDrop(),
      }),
    }),
    [prefixedPath]
  );

  // in case a file or directory is hoveed over another directory, we need to open it.
  useEffect(() => {
    if (!isOpen && isOver) {
      timer.current = window.setTimeout(() => setOpen(true), 500);
    } else {
      clearTimeout(timer.current);
    }
  }, [isOver]);

  //console.log(`${prefixedPath}: ${isOver}`);

  return (
    <>
      <DirectoryContainer
        key={prefixedPath}
        ref={drop}
        isOver={isOver}
        canDrop={canDrop}
      >
        <File
          depth={depth}
          isDirOpen={isOpen}
          onClick={toggle}
          path={prefixedPath + '/'}
        />
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
