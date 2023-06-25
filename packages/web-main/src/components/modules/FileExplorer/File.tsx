import { FC, MouseEvent, useState } from 'react';
import {
  styled,
  Button as TakaroButton,
  Tooltip,
  useTheme,
  EditableField,
  Dialog,
  IconButton,
} from '@takaro/lib-components';
import {
  AiFillFolder as DirClosedIcon,
  AiFillFolderOpen as DirOpenIcon,
  AiFillEdit as RenameIcon,
  AiOutlineClose as DeleteIcon,
  AiFillFileAdd as AddFileIcon,
} from 'react-icons/ai';

import { DiJsBadge as JsIcon } from 'react-icons/di';

import { motion, AnimatePresence } from 'framer-motion';
import { useSandpack } from '@codesandbox/sandpack-react';
import { useModule } from 'hooks/useModule';
import { FunctionType } from 'context/moduleContext';
import { getNewPath } from './utils';
import {
  useCommandCreate,
  useCommandRemove,
  useCommandUpdate,
  useCronJobCreate,
  useCronJobRemove,
  useCronJobUpdate,
  useHookCreate,
  useHookRemove,
  useHookUpdate,
} from 'queries/modules';

const Button = styled.button<{ isActive: boolean; depth: number }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0;
  background-color: transparent;
  padding-left: ${({ depth }) => `calc(${depth * 2}rem + .2rem)`};
  border-radius: 0;
  min-height: 2.8rem;
  line-height: 1;

  &:hover {
    background-color: ${({ theme }) => theme.colors.backgroundAlt};
  }

  div {
    display: flex;
    align-items: center;
  }

  span {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    color: ${({ isActive, theme }) =>
      isActive ? theme.colors.text : theme.colors.textAlt};
  }

  svg {
    margin-right: 1rem;
  }
`;

const FileContainer = styled.div`
  display: flex;
  align-items: center;
`;

const NewFileContainer = styled.div<{ depth: number }>`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding-left: ${({ depth }) => `${depth * 2 + 2}rem`};
`;

const ButtonContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;

export interface FileProps {
  filePath: string;

  // This is a wrapper function around sandpack.openFile()
  // in case it is undefined it means that it is a directory
  selectFile?: (path: string) => void;
  active?: boolean;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  depth: number;
  isDirOpen?: boolean;
}

export const File: FC<FileProps> = ({
  filePath,
  selectFile,
  isDirOpen,
  active,
  onClick,
  depth,
}) => {
  // TODO: create prop: IsDir() based on selectFile.

  const fileName = filePath.split('/').filter(Boolean).pop()!;
  const { moduleData } = useModule();
  const theme = useTheme();
  const { sandpack } = useSandpack();
  const [hover, setHover] = useState<boolean>(false);
  const [openDialog, setOpenDialog] = useState<boolean>(false);

  const [internalFileName, setInternalFileName] = useState(fileName);
  const [isEditing, setEditing] = useState<boolean>(false);
  const [showNewFileField, setShowNewFileField] = useState<boolean>(false);

  const { mutateAsync: updateHook } = useHookUpdate();
  const { mutateAsync: updateCommand } = useCommandUpdate();
  const { mutateAsync: updateCronJob } = useCronJobUpdate();

  const { mutateAsync: removeHook } = useHookRemove({
    moduleId: moduleData.id,
  });
  const { mutateAsync: removeCommand } = useCommandRemove({
    moduleId: moduleData.id,
  });
  const { mutateAsync: removeCronJob } = useCronJobRemove({
    moduleId: moduleData.id,
  });

  const { mutateAsync: createHook } = useHookCreate();
  const { mutateAsync: createCommand } = useCommandCreate();
  const { mutateAsync: createCronJob } = useCronJobCreate();

  // item is clicked in explorer
  const handleOnFileClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ): void => {
    if (selectFile) {
      selectFile(filePath);
    }

    // handle directory
    onClick?.(event);
  };

  const handleRename = async (newFileName: string) => {
    setEditing(false);

    const toRename = moduleData.fileMap[filePath];

    switch (toRename.type) {
      case FunctionType.Hooks:
        await updateHook({
          hookId: toRename.itemId,
          hook: { name: newFileName },
        });
        break;
      case FunctionType.Commands:
        await updateCommand({
          commandId: toRename.itemId,
          command: { name: newFileName },
        });
        break;
      case FunctionType.CronJobs:
        await updateCronJob({
          cronJobId: toRename.itemId,
          cronJob: { name: newFileName },
        });
        break;
      default:
        throw new Error('Invalid type');
    }

    // change path in moduleData
    // change path in sandpack
    const newPath = getNewPath(filePath, newFileName);
    const code = sandpack.files[filePath].code;
    sandpack.files[newPath] = { code: code };
    sandpack.setActiveFile(newPath);
    sandpack.closeFile(filePath);
    delete sandpack.files[filePath];
    setInternalFileName(newFileName);
  };

  const handleDelete = async () => {
    const toDelete = moduleData.fileMap[filePath];

    try {
      switch (toDelete.type) {
        case FunctionType.Hooks:
          await removeHook({ hookId: toDelete.itemId });
          break;
        case FunctionType.Commands:
          await removeCommand({ commandId: toDelete.itemId });
          break;
        case FunctionType.CronJobs:
          await removeCronJob({ cronJobId: toDelete.itemId });
          break;
        default:
          throw new Error('Invalid type');
      }
      // delete file from sandpack
      sandpack.closeFile(filePath);
      sandpack.deleteFile(filePath);
    } catch (e) {
      // TODO: handle error
      // deleting file failed
      console.log(e);
    }
  };

  const handleNewFile = async (newFileName: string) => {
    setShowNewFileField(false);
    const type = filePath.split('/').join('');

    try {
      switch (filePath.split('/').join('')) {
        case FunctionType.Hooks:
          await createHook({
            moduleId: moduleData.id!,
            name: newFileName,
            eventType: 'log',
            regex: `/w+/`,
          });
          break;
        case FunctionType.Commands:
          await createCommand({
            moduleId: moduleData.id!,
            name: newFileName,
            trigger: newFileName,
          });
          break;
        case FunctionType.CronJobs:
          await createCronJob({
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

  // handle click events
  const handleOnDeleteClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenDialog(true);
  };

  const handleOnRenameClick = (e: MouseEvent<HTMLButtonElement>) => {
    setEditing(true);
    e.preventDefault();
    e.stopPropagation();
  };

  const handleOnNewFileClick = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setShowNewFileField(true);
    sandpack.updateFile(`${filePath.slice(0, -1)}newFileeeee.tsx`);
  };

  const getIcon = (): JSX.Element => {
    if (selectFile) return <JsIcon size={12} fill={theme.colors.secondary} />;

    return isDirOpen ? (
      <DirOpenIcon fill={theme.colors.secondary} size={18} />
    ) : (
      <DirClosedIcon fill={theme.colors.secondary} size={18} />
    );
  };

  const getActions = (): JSX.Element => {
    if (moduleData.isBuiltIn) {
      return <></>;
    }

    if (selectFile) {
      return (
        <>
          <Tooltip placement="top">
            <Tooltip.Trigger asChild>
              <IconButton
                onClick={handleOnRenameClick}
                icon={<RenameIcon size={18} />}
              />
            </Tooltip.Trigger>
            <Tooltip.Content>Rename file</Tooltip.Content>
          </Tooltip>
          <Tooltip placement="top">
            <Tooltip.Trigger asChild>
              <IconButton icon={<DeleteIcon />} onClick={handleOnDeleteClick} />
            </Tooltip.Trigger>
            <Tooltip.Content>Delete file</Tooltip.Content>
          </Tooltip>
        </>
      );
    } else {
      return (
        <Tooltip placement="top">
          <Tooltip.Trigger asChild>
            <IconButton
              onClick={handleOnNewFileClick}
              icon={<AddFileIcon size={18} />}
            />
          </Tooltip.Trigger>
          <Tooltip.Content>New file</Tooltip.Content>
        </Tooltip>
      );
    }
  };

  return (
    <>
      <Button
        isActive={active ? true : false}
        depth={depth}
        onClick={handleOnFileClick}
        type="button"
        role="handle"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <FileContainer>
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
        </FileContainer>

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
          <JsIcon width={12} />
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
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <Dialog.Content>
          <Dialog.Heading>Remove file</Dialog.Heading>
          <Dialog.Body>
            <p>
              Are you sure you want to <strong>{fileName}</strong>? The file
              will be permanently removed.
            </p>
            <ButtonContainer>
              <TakaroButton
                fullWidth
                onClick={handleDelete}
                text="Remove file"
                color="error"
              />
            </ButtonContainer>
          </Dialog.Body>
        </Dialog.Content>
      </Dialog>
    </>
  );
};
