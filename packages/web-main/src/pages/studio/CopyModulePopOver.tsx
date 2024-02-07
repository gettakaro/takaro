import { styled, Popover, IconButton } from '@takaro/lib-components';
import { CopyModuleForm } from 'components/CopyModuleForm';
import { useModule } from 'hooks/useModule';
import { useNavigate } from 'react-router-dom';
import { AiOutlineCopy as CopyIcon, AiOutlineLink as LinkIcon } from 'react-icons/ai';
import { useSnackbar } from 'notistack';
import { PATHS } from 'paths';
import { useState } from 'react';

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

const CustomContent = styled.div`
  h4 {
    font-size: 1.2rem;
  }
  p {
    display: flex;
    align-items: center;

    div {
      cursor: pointer;

      &:hover {
        text-decoration: underline;
      }
    }
    svg {
      margin-right: 0.5rem;
    }
  }
`;

export const CopyModulePopOver = () => {
  const [open, setOpen] = useState<boolean>(false);
  const { moduleData } = useModule();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const handleSuccess = (moduleId: string) => {
    enqueueSnackbar('Module copied', {
      key: 'snack-module-copied',
      anchorOrigin: { horizontal: 'right', vertical: 'bottom' },
      variant: 'drawer',
      children: (
        <CustomContent>
          <h4>Module copied</h4>
          <p>
            <LinkIcon />
            <div
              onClick={() => {
                navigate(PATHS.studio.module(moduleId));
                closeSnackbar('snack-module-copied');
              }}
            >
              open new module
            </div>
          </p>
        </CustomContent>
      ),
    });
    setOpen(false);
  };

  return (
    <Popover placement="bottom" onOpenChange={setOpen} open={open}>
      <Popover.Trigger asChild>
        <IconButton icon={<CopyIcon />} onClick={() => setOpen(!open)} ariaLabel="Make copy of module" />
      </Popover.Trigger>
      <Popover.Content>
        <PopoverBody>
          <PopoverHeading>
            <h2>Copy module</h2>
          </PopoverHeading>
          <CopyModuleForm moduleId={moduleData.id} onSuccess={handleSuccess} />
        </PopoverBody>
      </Popover.Content>
    </Popover>
  );
};
