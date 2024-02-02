import { styled, Popover, IconButton } from '@takaro/lib-components';
import { CopyModuleForm } from 'components/CopyModuleForm';
import { useModule } from 'hooks/useModule';
import { useNavigate } from 'react-router-dom';
import { AiOutlineCopy as CopyIcon } from 'react-icons/ai';
import { PATHS } from 'paths';

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

export const CopyModulePopOver = () => {
  const { moduleData } = useModule();
  const navigate = useNavigate();

  return (
    <Popover placement="bottom">
      <Popover.Trigger asChild>
        <IconButton icon={<CopyIcon />} ariaLabel="Make copy of module" />
      </Popover.Trigger>
      <Popover.Content>
        <PopoverBody>
          <PopoverHeading>
            <h2>Copy module</h2>
          </PopoverHeading>
          <CopyModuleForm moduleId={moduleData.id} onSuccess={(moduleId) => navigate(PATHS.studio.module(moduleId))} />
        </PopoverBody>
      </Popover.Content>
    </Popover>
  );
};
