import { JSX, FC, MouseEvent, useMemo, useRef, useState } from 'react';
import {
  styled,
  Button as TakaroButton,
  Tooltip,
  useTheme,
  EditableField,
  Dialog,
  IconButton,
  ContextMenu,
} from '@takaro/lib-components';
import {
  AiFillFolder as DirClosedIcon,
  AiFillFolderOpen as DirOpenIcon,
  AiFillEdit as RenameIcon,
  AiOutlineClose as DeleteIcon,
  AiFillFileAdd as AddFileIcon,
} from 'react-icons/ai';
import { z } from 'zod';
import * as Sentry from '@sentry/react';
import { DiJsBadge as JsIcon } from 'react-icons/di';

import { motion, AnimatePresence } from 'framer-motion';
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
  useFunctionCreate,
  useFunctionRemove,
  useFunctionUpdate,
} from 'queries/module';
import { FileType, useStudioContext } from '../useStudioStore';
import { useNavigate } from '@tanstack/react-router';

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
    color: ${({ isActive, theme }) => (isActive ? theme.colors.text : theme.colors.textAlt)};
  }

  svg {
    margin-right: 1rem;
  }

  button {
    svg {
      margin-right: 0;
    }
  }
`;

const FileContainer = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  line-height: 1.5;
  svg {
    margin-right: ${({ theme }) => theme.spacing[1]};
  }
`;

const NewFileContainer = styled.div<{ depth: number }>`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding-left: ${({ depth }) => `${depth * 2 + 2}rem`};
  margin-top: ${({ theme }) => theme.spacing['0_5']};

  svg {
    margin-right: ${({ theme }) => theme.spacing[1]};
  }
`;

const ButtonContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;

export interface FileProps {
  path: string;
  /// in case it is undefined it means that it is a directory
  openFile?: (path: string) => void;
  active?: boolean;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  depth: number;
  isDirOpen?: boolean;
}

export const File: FC<FileProps> = ({ path, openFile, isDirOpen, active, onClick, depth }) => {
  const fileName = path.split('/').filter(Boolean).pop()!;
  const theme = useTheme();
  const [hover, setHover] = useState<boolean>(false);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const fileRef = useRef<HTMLButtonElement>(null);

  const moduleId = useStudioContext((s) => s.moduleId);
  const fileMap = useStudioContext((s) => s.fileMap);
  const updateFile = useStudioContext((s) => s.updateFile);
  const addFile = useStudioContext((s) => s.addFile);
  const closeFile = useStudioContext((s) => s.closeFile);
  const deleteFile = useStudioContext((s) => s.deleteFile);
  const readOnly = useStudioContext((s) => s.readOnly);
  const renameFile = useStudioContext((s) => s.renameFile);

  const fileNameValidation = useMemo(
    () =>
      z
        .string()
        .min(1, { message: 'The field must not be empty.' })
        .max(30, { message: 'The field must not be longer than 30 characters.' })
        .refine((value) => !value.includes('/'), { message: 'The field must not contain slashes.' }),
    [],
  );

  const [internalFileName, setInternalFileName] = useState(fileName);
  const [isEditing, setEditing] = useState<boolean>(false);
  const [showNewFileField, setShowNewFileField] = useState<boolean>(false);
  const [loadingNewFile, setLoadingNewFile] = useState<boolean>(false);
  const navigate = useNavigate();

  const { mutateAsync: updateHook } = useHookUpdate();
  const { mutateAsync: updateCommand } = useCommandUpdate();
  const { mutateAsync: updateCronJob } = useCronJobUpdate();
  const { mutateAsync: updateFunction } = useFunctionUpdate();

  const { mutateAsync: removeHook } = useHookRemove({ moduleId });
  const { mutateAsync: removeCommand } = useCommandRemove({ moduleId });
  const { mutateAsync: removeCronJob } = useCronJobRemove({ moduleId });
  const { mutateAsync: removeFunction } = useFunctionRemove({ moduleId });

  const { mutateAsync: createHook } = useHookCreate();
  const { mutateAsync: createCommand } = useCommandCreate();
  const { mutateAsync: createCronJob } = useCronJobCreate();
  const { mutateAsync: createFunction } = useFunctionCreate();

  // item is clicked in explorer
  const handleOnFileClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
    if (openFile) {
      openFile(path);
      navigate({
        from: '/studio/$moduleId',
        search: {
          file: path,
        },
      });
    }
    onClick?.(event);
  };

  const handleRename = async (newFileName: string) => {
    setEditing(false);

    const toRename = fileMap[path];

    switch (toRename.type) {
      case FileType.Hooks:
        await updateHook({
          hookId: toRename.itemId,
          hook: { name: newFileName },
        });
        break;
      case FileType.Commands:
        await updateCommand({
          commandId: toRename.itemId,
          command: { name: newFileName },
        });
        break;
      case FileType.CronJobs:
        await updateCronJob({
          cronJobId: toRename.itemId,
          cronJob: { name: newFileName },
        });
        break;
      case FileType.Functions:
        await updateFunction({
          functionId: toRename.functionId,
          fn: { name: newFileName },
        });
        break;
      default:
        throw new Error('Invalid type');
    }
    const newPath = getNewPath(path, newFileName);
    renameFile(path, newPath);
    setInternalFileName(newFileName);
  };

  const handleDelete = async () => {
    const toDelete = fileMap[path];

    try {
      switch (toDelete.type) {
        case FileType.Hooks:
          await removeHook({ hookId: toDelete.itemId });
          break;
        case FileType.Commands:
          await removeCommand({ commandId: toDelete.itemId });
          break;
        case FileType.CronJobs:
          await removeCronJob({ cronJobId: toDelete.itemId });
          break;
        case FileType.Functions:
          await removeFunction({ functionId: toDelete.functionId });
          break;
        default:
          throw new Error('Invalid type');
      }
      closeFile(path);
      deleteFile(path);
    } catch (e) {
      Sentry.captureException(e);
    }
  };

  const handleNewFile = async (newFileName: string) => {
    setShowNewFileField(false);
    setLoadingNewFile(true);
    const type = path.split('/').join('');
    let functionId = '';
    let itemId: string | undefined = undefined;
    let code = '';

    try {
      switch (type) {
        case FileType.Hooks: {
          const hook = await createHook({
            moduleId,
            name: newFileName,
            eventType: 'log',
            regex: 'takaro-hook-regex-placeholder',
          });
          functionId = hook.function.id;
          itemId = hook.id;
          code = hook.function.code;
          break;
        }
        case FileType.Commands: {
          const command = await createCommand({
            moduleId,
            name: newFileName,
            trigger: newFileName,
          });
          functionId = command.function.id;
          itemId = command.id;
          code = command.function.code;
          break;
        }
        case FileType.CronJobs: {
          const cronjob = await createCronJob({
            moduleId,
            name: newFileName,
            temporalValue: '0 0 * * *',
          });
          functionId = cronjob.function.id;
          itemId = cronjob.id;
          code = cronjob.function.code;
          break;
        }
        case FileType.Functions: {
          const func = await createFunction({
            moduleId,
            name: newFileName,
          });
          functionId = func.id;
          code = func.code;
          break;
        }
        default:
          throw new Error('Invalid type');
      }
      const newPath = `/${type}/${newFileName}`;
      addFile({
        path: newPath,
        type,
        functionId,
        itemId: itemId ?? '',
        code,
      });
      setInternalFileName(newFileName);
    } catch (e) {
      Sentry.captureException(e);
    } finally {
      setLoadingNewFile(false);
    }
  };

  // handle click events
  const handleOnDeleteClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenDialog(true);
  };

  const handleOnRenameClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setEditing(true);
  };

  const handleOnNewFileClick = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setShowNewFileField(true);
    // we need a placeholder here to make sure the input field is rendered
    updateFile(`${path.slice(0, -1)}/new-file`, '');
  };

  const getIcon = (): JSX.Element => {
    if (openFile) return <JsIcon size={12} fill={theme.colors.secondary} />;

    return isDirOpen ? (
      <DirOpenIcon fill={theme.colors.secondary} size={18} />
    ) : (
      <DirClosedIcon fill={theme.colors.secondary} size={18} />
    );
  };

  const getActions = (): JSX.Element => {
    if (openFile) {
      return (
        <>
          <Tooltip placement="top">
            <Tooltip.Trigger asChild>
              <IconButton onClick={handleOnRenameClick} ariaLabel="Rename file" icon={<RenameIcon size={18} />} />
            </Tooltip.Trigger>
            <Tooltip.Content>Rename file</Tooltip.Content>
          </Tooltip>
          <Tooltip placement="top">
            <Tooltip.Trigger asChild>
              <IconButton icon={<DeleteIcon />} onClick={handleOnDeleteClick} ariaLabel="Delete file" />
            </Tooltip.Trigger>
            <Tooltip.Content>Delete file</Tooltip.Content>
          </Tooltip>
        </>
      );
    }
    return (
      <>
        <Tooltip placement="top">
          <Tooltip.Trigger asChild>
            <IconButton ariaLabel="New file" onClick={handleOnNewFileClick} icon={<AddFileIcon size={18} />} />
          </Tooltip.Trigger>
          <Tooltip.Content>New file</Tooltip.Content>
        </Tooltip>
      </>
    );
  };

  return (
    <>
      {/* Context menu folder */}
      {openFile && !readOnly && (
        <ContextMenu targetRef={fileRef}>
          <ContextMenu.Group>
            <ContextMenu.Item label="Rename file" onClick={handleOnRenameClick} />
            <ContextMenu.Item label="Delete file" onClick={handleOnDeleteClick} />
          </ContextMenu.Group>
        </ContextMenu>
      )}

      <Button
        isActive={active ? true : false}
        depth={depth}
        onClick={handleOnFileClick}
        type="button"
        role="handle"
        onMouseEnter={() => (readOnly ? null : setHover(true))}
        onMouseLeave={() => (readOnly ? null : setHover(false))}
        ref={fileRef}
      >
        <FileContainer>
          {getIcon()}
          {isEditing || openFile ? (
            <EditableField
              name="file"
              isEditing={isEditing}
              onEdited={handleRename}
              editingChange={(edited) => setEditing(edited)}
              disabled={readOnly}
              validationSchema={fileNameValidation}
              required
              loading={loadingNewFile}
              value={internalFileName}
            />
          ) : (
            <span>{fileName}</span>
          )}
        </FileContainer>

        <AnimatePresence>
          {hover && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              {getActions()}
            </motion.div>
          )}
        </AnimatePresence>
      </Button>
      {showNewFileField && (
        <NewFileContainer depth={depth}>
          <JsIcon size={12} fill={theme.colors.secondary} />
          <EditableField
            disabled={readOnly}
            name="new-file"
            isEditing={true}
            editingChange={setShowNewFileField}
            validationSchema={fileNameValidation}
            onEdited={handleNewFile}
          />
        </NewFileContainer>
      )}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <Dialog.Content>
          <Dialog.Heading>Remove file</Dialog.Heading>
          <Dialog.Body>
            <p>
              Are you sure you want to delete <strong>{fileName}</strong>? The file will be permanently removed.
            </p>
            <ButtonContainer>
              <TakaroButton fullWidth onClick={handleDelete} text="Remove file" color="error" />
            </ButtonContainer>
          </Dialog.Body>
        </Dialog.Content>
      </Dialog>
    </>
  );
};
