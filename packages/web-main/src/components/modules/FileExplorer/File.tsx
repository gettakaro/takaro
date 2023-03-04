import { createRef, FC, MouseEvent, useState } from 'react';
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
import { useApiClient } from 'hooks/useApiClient';
import { useModule } from 'hooks/useModule';
import { FunctionType } from 'context/moduleContext';
import { getFileName, getNewPath } from './utils';

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

const NewFileContainer = styled.div<{ depth: number }>`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding-left: ${({ depth }) => `${depth * 2 + 2}rem`};
`;

export interface FileProps {
  path: string;

  // This is a wrapper function around sandpack.openFile()
  // in case it is undefined it means that it is a directory
  selectFile?: (path: string) => void;
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
  const apiClient = useApiClient();
  const theme = useTheme();
  const { sandpack } = useSandpack();
  const [hover, setHover] = useState<boolean>(false);

  const [internalFileName, setInternalFileName] = useState(fileName);
  const [isEditing, setEditing] = useState<boolean>(false);
  const [showNewFileField, setShowNewFileField] = useState<boolean>(false);

  const [Wrapper, openDeleteFileModal, closeDeleteFileModal] = useModal();
  const ref = createRef<HTMLDivElement>();
  useOutsideAlerter(ref, () => closeDeleteFileModal());

  // item is clicked in explorer
  const handleOnFileClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ): void => {
    if (selectFile) {
      selectFile(path);
    }

    // handle directory
    onClick?.(event);
  };

  const handleRename = async (newFileName: string) => {
    setEditing(false);

    const toRename = moduleData.fileMap[fileName];
    switch (toRename.type) {
      case FunctionType.Hooks:
        await apiClient.hook.hookControllerUpdate(toRename.itemId, {
          name: newFileName,
        });
        break;
      case FunctionType.Commands:
        await apiClient.command.commandControllerUpdate(toRename.itemId, {
          name: newFileName,
        });
        break;
      case FunctionType.CronJobs:
        await apiClient.cronjob.cronJobControllerUpdate(toRename.itemId, {
          name: newFileName,
        });
        break;
    }

    // change path in moduleData
    // change path in sandpack
    const newPath = getNewPath(path, newFileName);
    const code = sandpack.files[path].code;
    sandpack.files[newPath] = { code: code };
    sandpack.setActiveFile(newPath);
    sandpack.closeFile(path);
    delete sandpack.files[path];
    setInternalFileName(newFileName);
  };

  const handleDelete = async () => {
    const toDelete = moduleData.fileMap[getFileName(path)];

    try {
      switch (toDelete.type) {
        case FunctionType.Hooks:
          await apiClient.hook.hookControllerRemove(toDelete.itemId);
          break;
        case FunctionType.Commands:
          await apiClient.command.commandControllerRemove(toDelete.itemId);
          break;
        case FunctionType.CronJobs:
          await apiClient.cronjob.cronJobControllerRemove(toDelete.itemId);
          break;
        default:
          throw new Error('Invalid type');
      }
      // delete file from sandpack
      sandpack.closeFile(path);
      sandpack.deleteFile(path);
    } catch (e) {
      // TODO: handle error
      // deleting file failed
      console.log(e);
    }
  };

  const handleNewFile = async (newFileName: string) => {
    setShowNewFileField(false);
    const type = path.split('/').join('');

    try {
      switch (path.split('/').join('')) {
        case FunctionType.Hooks:
          await apiClient.hook.hookControllerCreate({
            moduleId: moduleData.id!,
            name: newFileName,
            eventType: 'log',
            regex: `/\w+/`,
          });

          break;
        case FunctionType.Commands:
          await apiClient.command.commandControllerCreate({
            moduleId: moduleData.id!,
            name: newFileName,
            trigger: newFileName,
          });
          break;
        case FunctionType.CronJobs:
          await apiClient.cronjob.cronJobControllerCreate({
            moduleId: moduleData.id!,
            name: newFileName,
            temporalValue: '0 0 * * *',
          });
          break;
        default:
          throw new Error('Invalid type');
      }
      const newPath = `${type}/${newFileName}`;

      sandpack.updateFile({ [newPath]: { code: '' } });
      sandpack.setActiveFile(newPath);
      setInternalFileName(newFileName);
    } catch (e) {
      console.log(e);
    }
  };

  // add file to sandpack

  // handle click events
  const handleOnDeleteClick = (e: MouseEvent<SVGElement>) => {
    e.preventDefault();
    e.stopPropagation();
    openDeleteFileModal();
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
        close={closeDeleteFileModal}
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
          <Tooltip label="New file" placement="top">
            <div>
              <FileIcon size={16} onClick={handleOnNewFileClick} />
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
        onClick={handleOnFileClick}
        type="button"
        role="handle"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <div>
          {getIcon()}
          {isEditing || selectFile ? (
            <EditableField
              name="file"
              allowEmpty={false}
              isEditing={isEditing}
              onEdited={handleRename}
              editingChange={(edited) => setEditing(edited)}
              value={internalFileName}
            />
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
        <NewFileContainer depth={depth}>
          <FileIcon size={20} />
          <EditableField
            allowEmpty={false}
            name="new-file"
            isEditing={true}
            editingChange={(e) => {
              setShowNewFileField(e);
            }}
            onEdited={handleNewFile}
          />
        </NewFileContainer>
      )}
      {getModal()}
    </>
  );
};
