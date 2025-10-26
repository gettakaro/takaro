import { Company, Tooltip, Card, Chip, styled } from '@takaro/lib-components';
import { ModuleOutputDTO } from '@takaro/apiclient';
import { FC } from 'react';
import { SpacedRow, ActionIconsContainer, InnerBody } from '../style';
import { ModuleActions } from '../../../routes/_auth/_global/-modules/ModuleActions';
import { ModulesViewProps } from '../../../routes/_auth/_global/modules';

interface IModuleCardProps extends ModulesViewProps {
  mod: ModuleOutputDTO;
}

const DescriptionDiv = styled.div`
  max-height: 100px;
  overflow-y: auto;
  margin-bottom: 10px;
`;

export const ModuleDefinitionCard: FC<IModuleCardProps> = ({ mod, canCreateModule }) => {
  // Get the latest tag from mod.versions (skip 'latest' tag)
  const newestTag =
    mod.versions && mod.versions.length > 0 ? (mod.versions.find((v) => v.tag !== 'latest')?.tag ?? null) : null;

  const { latestVersion } = mod;

  return (
    <>
      <Card data-testid={`${mod.name}`}>
        <Card.Body>
          <InnerBody>
            <SpacedRow>
              <h2>{mod.name}</h2>
              <ActionIconsContainer>
                <Tooltip>
                  <Tooltip.Trigger>
                    <Chip
                      variant="outline"
                      color={newestTag ? 'primary' : 'secondary'}
                      label={newestTag ?? 'no tags'}
                    />
                  </Tooltip.Trigger>
                  <Tooltip.Content>Latest tag</Tooltip.Content>
                </Tooltip>
                {mod.builtin && (
                  <Tooltip>
                    <Tooltip.Trigger>
                      <Company
                        key={`builtin-module-icon-${mod.id}`}
                        textVisible={false}
                        size="tiny"
                        iconColor="secondary"
                      />
                    </Tooltip.Trigger>
                    <Tooltip.Content>
                      This is a built-in module, you cannot edit or delete it.
                      <br />
                      You can however copy it and edit the copy.
                      <br />
                      Open the module by clicking on it.
                    </Tooltip.Content>
                  </Tooltip>
                )}
                <ModuleActions mod={mod} canCreateModule={canCreateModule} />
              </ActionIconsContainer>
            </SpacedRow>
            <DescriptionDiv>{latestVersion.description}</DescriptionDiv>
            <span style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {latestVersion.commands.length > 0 && <p>Commands: {latestVersion.commands.length}</p>}
              {latestVersion.hooks.length > 0 && <p>Hooks: {latestVersion.hooks.length}</p>}
              {latestVersion.cronJobs.length > 0 && <p>Cronjobs: {latestVersion.cronJobs.length}</p>}
              {latestVersion.permissions.length > 0 && <p>Permissions: {latestVersion.permissions.length}</p>}
            </span>
          </InnerBody>
        </Card.Body>
      </Card>
    </>
  );
};
