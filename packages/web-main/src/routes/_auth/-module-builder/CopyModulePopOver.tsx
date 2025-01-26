import { styled, Popover, IconButton, Tooltip } from '@takaro/lib-components';
import { CopyModuleForm } from 'components/CopyModuleForm';
import { AiOutlineCopy as CopyIcon } from 'react-icons/ai';
import { useSnackbar } from 'notistack';
import { FC, useState } from 'react';
import { ModuleOutputDTO } from '@takaro/apiclient';

const PopoverBody = styled.div`
  max-width: 400px;
  padding: ${({ theme }) => theme.spacing[2]};
`;

const PopoverHeading = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing[1]};
`;

interface CopyModulePopOverProps {
  mod: ModuleOutputDTO;
}

export const CopyModulePopOver: FC<CopyModulePopOverProps> = ({ mod }) => {
  const [open, setOpen] = useState<boolean>(false);
  const { enqueueSnackbar } = useSnackbar();

  const handleSuccess = () => {
    enqueueSnackbar('Module copied!', {
      variant: 'default',
      type: 'success',
    });
    setOpen(false);
  };

  return (
    <Popover placement="bottom" onOpenChange={setOpen} open={open}>
      <Popover.Trigger asChild>
        <div>
          <Tooltip>
            <Tooltip.Trigger>
              <IconButton icon={<CopyIcon />} onClick={() => setOpen(!open)} ariaLabel="Make copy of module" />
            </Tooltip.Trigger>
            <Tooltip.Content>Copy Module</Tooltip.Content>
          </Tooltip>
        </div>
      </Popover.Trigger>
      <Popover.Content>
        <PopoverBody>
          <PopoverHeading>
            <h2>Copy module</h2>
          </PopoverHeading>
          <CopyModuleForm mod={mod} onSuccess={handleSuccess} />
        </PopoverBody>
      </Popover.Content>
    </Popover>
  );
};
