import { createRef, FC, MouseEvent, useRef, useState } from 'react';
import {
  EditableField,
  styled,
  Tooltip,
  useModal,
  useOutsideAlerter,
  useTheme,
  ConfirmationModal,
} from '@takaro/lib-components';
import {
  AiFillFolder as DirClosedIcon,
  AiFillFolderOpen as DirOpenIcon,
  AiFillFile as FileIcon,
  AiFillEdit as RenameIcon,
  AiOutlineClose as DeleteIcon,
} from 'react-icons/ai';
import { motion, AnimatePresence } from 'framer-motion';
import { FloatingDelayGroup } from '@floating-ui/react-dom-interactions';
import { useSandpack } from '@codesandbox/sandpack-react';
import { useDrag } from 'react-dnd';
import { ItemTypes } from './ItemTypes';
import { useApiClient } from 'hooks/useApiClient';
import { useModule } from 'hooks/useModule';
import { camelize } from './utils';

const Button = styled.button<{ isActive: boolean; depth: number }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.2rem 0;
  background-color: transparent;
  padding-left: ${({ depth }) => `${depth * 2}rem`};
  border-radius: 0;

  div {
    display: flex;
    align-items: center;
  }

  span {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    color: ${({ isActive, theme }) =>
      isActive ? theme.colors.primary : theme.colors.text};

    &:hover {
      color: ${({ theme }) => theme.colors.gray};
    }
  }

  svg {
    margin-right: 1rem;
  }
`;

export interface FileProps {
  path: string;
  selectFile?: (path: string) => void; // basically checks if it is a file or a directory
  active?: boolean;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  depth: number;
  isDirOpen?: boolean;
}

export const File: FC<FileProps> = ({
  path,
  selectFile,
  isDirOpen,
  active,
  onClick,
  depth,
}) => {
  // TODO: create prop: IsDir() based on selectFile.

  const fileName = path.split('/').filter(Boolean).pop()!;
  const { moduleData } = useModule();
  const client = useApiClient();
  const theme = useTheme();
  const { sandpack } = useSandpack();
  const [hover, setHover] = useState<boolean>(false);

  const newFileInputRef = useRef<HTMLInputElement>(null);
  const [showNewFileField, setShowNewFileField] = useState(false);
  const [newFileName, setNewFileName] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);
  const [internalFileName, setInternalFileName] = useState(fileName);
  const [isEditing, setEditing] = useState<boolean>(false);

  const [Wrapper, open, close] = useModal();
  const ref = createRef<HTMLDivElement>();
  useOutsideAlerter(ref, () => close());

  const [, drag] = useDrag(() => ({
    type: ItemTypes.FILE,
    item: { path },
  }));

  // const extension = fileName.split('.').pop();

  const onClickButton = (event: React.MouseEvent<HTMLButtonElement>): void => {
    if (selectFile) {
      selectFile(path);
    }
    onClick?.(event);
  };

  const handleDelete = async () => {
    // everything underneed this is in case we are deleting a directory
    if (!selectFile) {
      const toDelete = Object.keys(sandpack.files).filter((filePath) =>
        filePath.startsWith(path.slice(0, -1))
      );

      // TODO: use a regex instead
      // --> regex: depending on curren path --> hook, command, cronjob
      const topLvl = path.slice(1, path.slice(1).indexOf('/'));

      const promises: Array<Promise<unknown>> = [];
      for (const i of toDelete) {
        if (moduleData.fileMap && moduleData.fileMap[i]) {
          promises.push(
            new Promise(async () => {
              await client[topLvl][`${'cronJob'}ControllerRemove`](
                moduleData.fileMap![i]
              );
              sandpack.deleteFile(i);
            })
          );
        }
      }
      await Promise.all(promises);
    }
  };

  const handleNewFile = async () => {
    setShowNewFileField(false);

    const newPath = path.slice(0, -1) + newFileName;

    const hook = (
      await client.hook.hookControllerCreate({
        moduleId: moduleData.id!,
        name: newPath,
        eventType: 'log',
        regex: `/\w+/`,
      })
    ).data.data;

    sandpack.addFile(newPath, 'this is the content or what?');

    // add file to sandpack
  };

  const handleRename = () => {
    setEditing(false);
    const filePaths = sandpack.visibleFiles;
    //const content = filePaths[path];

    if (selectFile) {
    }

    // if file
    //
    //
    // if dir
  };

  // handle click events
  const handleOnDeleteClick = (e: MouseEvent<SVGElement>) => {
    e.preventDefault();
    e.stopPropagation();
    open();
  };

  const handleOnRenameClick = (e: MouseEvent<SVGElement>) => {
    setEditing(true);
    e.preventDefault();
    e.stopPropagation();
  };

  const handleOnNewFileClick = async (e: MouseEvent<SVGElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setShowNewFileField(true);
    sandpack.updateFile(`${path.slice(0, -1)}newFileeeee.tsx`);
  };

  const handleOnNewDirClick = (e: MouseEvent<SVGElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const dirName = 'new_dir_name';

    // we need to open the folder
    onClick?.(e as any); // TODO: fix this type

    // add a . file
    sandpack.addFile(
      {
        [`${path.slice(0, -1)}${dirName}/.`]: {
          code: '',
          hidden: true,
          active: false,
          readOnly: true,
        },
      },
      ''
    );
  };

  const getIcon = (): JSX.Element => {
    if (selectFile) return <FileIcon size={20} />;

    return isDirOpen ? (
      <DirOpenIcon fill={theme.colors.primary} size={20} />
    ) : (
      <DirClosedIcon fill={theme.colors.primary} size={20} />
    );
  };

  const getModal = (): JSX.Element => (
    <Wrapper>
      <ConfirmationModal
        type="error"
        title={`Delete ${selectFile ? 'file' : 'directory'} `}
        close={close}
        description={`Are you sure you want to delete '${fileName}'? The ${
          selectFile ? 'file' : 'directory'
        } will be permanently removed.`}
        action={handleDelete}
        actionText="Delete"
        ref={ref}
      />
    </Wrapper>
  );

  const getActions = (): JSX.Element => {
    if (selectFile) {
      return (
        <FloatingDelayGroup delay={{ open: 1000, close: 200 }}>
          <Tooltip label="Rename" placement="top">
            <div>
              <RenameIcon size={16} onClick={handleOnRenameClick} />
            </div>
          </Tooltip>
          <Tooltip label="Delete" placement="top">
            <div>
              <DeleteIcon onClick={handleOnDeleteClick} size={16} />
            </div>
          </Tooltip>
        </FloatingDelayGroup>
      );
    } else {
      return (
        <FloatingDelayGroup delay={{ open: 1000, close: 200 }}>
          <Tooltip label="Rename" placement="top">
            <div>
              <RenameIcon size={16} onClick={handleOnRenameClick} />
            </div>
          </Tooltip>
          <Tooltip label="New file" placement="top">
            <div>
              <FileIcon size={16} onClick={handleOnNewFileClick} />
            </div>
          </Tooltip>
          <Tooltip label="New directory" placement="top">
            <div>
              <DirClosedIcon size={16} onClick={handleOnNewDirClick} />
            </div>
          </Tooltip>
          <Tooltip label="Delete" placement="top">
            <div>
              <DeleteIcon onClick={handleOnDeleteClick} size={16} />
            </div>
          </Tooltip>
        </FloatingDelayGroup>
      );
    }
  };

  return (
    <>
      <Button
        isActive={active ? true : false}
        depth={depth}
        title={fileName}
        onClick={onClickButton}
        type="button"
        role="handle"
        ref={drag}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <div>
          {getIcon()}
          {isEditing || selectFile ? (
            <EditableField
              allowEmpty={false}
              childRef={inputRef}
              text={internalFileName}
              isEditing={isEditing}
              onEdited={handleRename}
            >
              <input
                ref={inputRef}
                value={internalFileName}
                onChange={(e) => setInternalFileName(e.target.value)}
              />
            </EditableField>
          ) : (
            <span>{fileName}</span>
          )}
        </div>

        <AnimatePresence>
          {hover && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {getActions()}
            </motion.div>
          )}
        </AnimatePresence>
      </Button>

      {showNewFileField && (
        <div>
          <FileIcon size={20} />
          <EditableField
            allowEmpty={false}
            text=""
            isEditing={true}
            childRef={newFileInputRef}
            onEdited={handleNewFile}
          >
            <input
              ref={newFileInputRef}
              onChange={(e) => setNewFileName(e.target.value)}
            />
          </EditableField>
        </div>
      )}
      {getModal()}
    </>
  );
};
