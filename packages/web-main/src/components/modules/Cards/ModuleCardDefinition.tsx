import { ModuleOutputDTO } from '@takaro/apiclient';
import {
  Company,
  Tooltip,
  Dialog,
  DialogContent,
  DialogHeading,
  Button,
} from '@takaro/lib-components';
import { PATHS } from 'paths';
import { useModuleRemove } from 'queries/modules';
import { FC, useState, MouseEvent } from 'react';
import { FaTrash as TrashIcon, FaPencilAlt as EditIcon } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import {
  ModuleCardContainer,
  SpacedRow,
  ActionIconsContainer,
  DeleteDialogContainer,
} from './style';

interface IModuleCardProps {
  mod: ModuleOutputDTO;
  onClick?: () => void;
}

export const ModuleCardDefinition: FC<IModuleCardProps> = ({
  mod,
  onClick,
}) => {
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const { mutateAsync, isLoading: isDeleting } = useModuleRemove();
  const navigate = useNavigate();

  const handleOnDelete = async (e: MouseEvent) => {
    e.stopPropagation();
    await mutateAsync({ id: mod.id });
    setOpenDialog(false);
  };

  return (
    <ModuleCardContainer active={false} onClick={onClick}>
      <SpacedRow>
        <h2>{mod.name}</h2>
        <ActionIconsContainer>
          {mod.builtin ? (
            <Tooltip label="This is a built-in module, you cannot edit or delete it">
              <Company
                key={`builtin-module-icon-${mod.id}`}
                textVisible={false}
                size="tiny"
                iconColor="secondary"
              />
            </Tooltip>
          ) : (
            <>
              <EditIcon
                key={`edit-module-icon-${mod.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(PATHS.modules.update(mod.id));
                }}
              />
              <TrashIcon
                key={`remove-module-icon-${mod.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenDialog(true);
                }}
              />
            </>
          )}
        </ActionIconsContainer>
      </SpacedRow>
      <p>{mod.description}</p>
      <span>
        {mod.commands.length > 0 && <p>Commands: {mod.commands.length}</p>}
        {mod.hooks.length > 0 && <p>Hooks: {mod.hooks.length}</p>}
        {mod.cronJobs.length > 0 && <p>Cronjobs: {mod.cronJobs.length}</p>}
      </span>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeading>Module "{mod.name}" </DialogHeading>
          <DeleteDialogContainer>
            <h2>Delete module</h2>
            <p>
              Are you sure you want to delete the module "{mod.name}"? This
              action is irreversible!{' '}
            </p>
            <Button
              isLoading={isDeleting}
              onClick={(e) => handleOnDelete(e)}
              fullWidth
              text={`Delete module`}
              color="error"
            />
          </DeleteDialogContainer>
        </DialogContent>
      </Dialog>
    </ModuleCardContainer>
  );
};
