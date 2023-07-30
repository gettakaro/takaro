import { ModuleOutputDTO } from '@takaro/apiclient';
import { Company, Tooltip, Dialog, Button, IconButton } from '@takaro/lib-components';
import { PATHS } from 'paths';
import { useModuleRemove } from 'queries/modules';
import { FC, useState, MouseEvent } from 'react';
import { AiOutlinePlus as AddIcon, AiOutlineEdit as EditIcon, AiOutlineDelete as DeleteIcon } from 'react-icons/ai';
import { useNavigate, Link } from 'react-router-dom';
import { ModuleCardContainer, SpacedRow, ActionIconsContainer, AddModuleCard } from './style';

interface IModuleCardProps {
  mod: ModuleOutputDTO;
}

export const ModuleCardDefinition: FC<IModuleCardProps> = ({ mod }) => {
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const { mutateAsync, isLoading: isDeleting } = useModuleRemove();
  const navigate = useNavigate();

  const handleOnDelete = async (e: MouseEvent) => {
    e.stopPropagation();
    await mutateAsync({ id: mod.id });
    setOpenDialog(false);
  };

  return (
    <ModuleCardContainer onClick={() => window.open(PATHS.studio.module(mod.id))} role="link" tabIndex={0}>
      <SpacedRow>
        <h2>{mod.name}</h2>
        <ActionIconsContainer>
          {mod.builtin ? (
            <Tooltip>
              <Tooltip.Trigger>
                <Company key={`builtin-module-icon-${mod.id}`} textVisible={false} size="tiny" iconColor="secondary" />
              </Tooltip.Trigger>
              <Tooltip.Content>This is a built-in module, you cannot edit or delete it</Tooltip.Content>
            </Tooltip>
          ) : (
            <>
              <Tooltip>
                <Tooltip.Trigger>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(PATHS.modules.update(mod.id));
                    }}
                    ariaLabel="Edit module"
                    icon={<EditIcon key={`edit-module-icon-${mod.id}`} />}
                  />
                </Tooltip.Trigger>
                <Tooltip.Content>Edit module</Tooltip.Content>
              </Tooltip>
              <Tooltip>
                <Tooltip.Trigger>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenDialog(true);
                    }}
                    ariaLabel="Delete module"
                    icon={<DeleteIcon key={`remove-module-icon-${mod.id}`} />}
                  />
                </Tooltip.Trigger>
                <Tooltip.Content>Delete module</Tooltip.Content>
              </Tooltip>
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
        <Dialog.Content>
          <Dialog.Heading size={4}>
            Module: <span style={{ textTransform: 'capitalize' }}>{mod.name}</span>{' '}
          </Dialog.Heading>
          <Dialog.Body>
            <h2>Delete module</h2>
            <p>
              Are you sure you want to delete the module <strong>{mod.name}</strong>? This action is irreversible!{' '}
            </p>
            <Button
              isLoading={isDeleting}
              onClick={(e) => handleOnDelete(e)}
              fullWidth
              text={'Delete module'}
              color="error"
            />
          </Dialog.Body>
        </Dialog.Content>
      </Dialog>
    </ModuleCardContainer>
  );
};

export const EmptyModuleCardDefinition: FC = () => {
  return (
    <AddModuleCard>
      <Link to={PATHS.modules.create()}>
        <AddIcon size={24} />
        <h3>Module</h3>
      </Link>
    </AddModuleCard>
  );
};
