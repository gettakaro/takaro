import { styled, Popover, IconButton, Tooltip } from '@takaro/lib-components';
import { CopyModuleForm } from '../../components/CopyModuleForm';
import { AiOutlineCopy as CopyIcon } from 'react-icons/ai';
import { useSnackbar } from 'notistack';
import { FC, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { moduleQueryOptions } from '../../queries/module';

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
  moduleId: string;
}

export const CopyModulePopOver: FC<CopyModulePopOverProps> = ({ moduleId }) => {
  const [open, setOpen] = useState<boolean>(false);
  const { enqueueSnackbar } = useSnackbar();
  const { data, isPending } = useQuery(moduleQueryOptions(moduleId));

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
            <h2 style={{ minWidth: '300px', textAlign: 'center' }}>Copy module</h2>
          </PopoverHeading>
          {isPending || !data ? <p>Loading...</p> : <CopyModuleForm mod={data} onSuccess={handleSuccess} />}
        </PopoverBody>
      </Popover.Content>
    </Popover>
  );
};
