import { styled, Button, Tooltip } from '@takaro/lib-components';
import { useModuleBuilderContext } from './useModuleBuilderStore';
import { useNavigate } from '@tanstack/react-router';
import { UnControlledModuleVersionTagSelectField } from '../../../components/selects/ModuleVersionSelectField';
import { useState } from 'react';
import { ModuleTagDialog } from '../../../components/dialogs/ModuleTagDialog';
import { CopyModulePopOver } from './CopyModulePopOver';

const Container = styled.header`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-transform: capitalize;
  border-bottom: 1px solid ${({ theme }) => theme.colors.backgroundAccent};
  height: ${({ theme }) => theme.spacing[5]};
  padding-left: ${({ theme }) => theme.spacing[2]};
  padding-right: ${({ theme }) => theme.spacing[2]};
`;

const Flex = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing[1]};
`;

export const Header = () => {
  const moduleName = useModuleBuilderContext((s) => s.moduleName);
  const moduleId = useModuleBuilderContext((s) => s.moduleId);
  const moduleVersions = useModuleBuilderContext((s) => s.moduleVersions);
  const moduleVersionTag = useModuleBuilderContext((s) => s.versionTag);
  const navigate = useNavigate({ from: '/module-builder/$moduleId/$moduleVersionTag' });
  const [openTagDialog, setOpenTagDialog] = useState<boolean>(false);
  const isLatest: boolean = moduleVersionTag === 'latest';

  const handleOnModuleVersionTagChanged = (selectedModuleVersionTag: string) => {
    navigate({
      to: '/module-builder/$moduleId/$moduleVersionTag',
      params: { moduleId, moduleVersionTag: selectedModuleVersionTag },
    });
  };

  return (
    <Container>
      <Flex>
        <UnControlledModuleVersionTagSelectField
          options={moduleVersions}
          value={moduleVersionTag}
          onChange={handleOnModuleVersionTagChanged}
        />
      </Flex>
      <Flex>
        <span>{moduleName}</span>
        <CopyModulePopOver moduleId={moduleId} />
      </Flex>

      <Flex>
        <Tooltip disabled={!isLatest}>
          <Tooltip.Trigger>
            <Button text="Tag version" disabled={!isLatest} onClick={() => setOpenTagDialog(true)} />
          </Tooltip.Trigger>
          <Tooltip.Content>Only the latest version can be used to create a new tagged version</Tooltip.Content>
        </Tooltip>
        <ModuleTagDialog
          open={openTagDialog}
          onOpenChange={setOpenTagDialog}
          moduleId={moduleId}
          moduleName={moduleName}
        />
      </Flex>
    </Container>
  );
};
