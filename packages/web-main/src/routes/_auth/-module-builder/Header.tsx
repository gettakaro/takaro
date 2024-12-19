import { styled, UnControlledSelectField } from '@takaro/lib-components';
import { CopyModulePopOver } from './CopyModulePopOver';
import { useModuleBuilderContext } from './useModuleBuilderStore';
import { useNavigate, useParams } from '@tanstack/react-router';

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
  const navigate = useNavigate({ from: '/module-builder/$moduleId/$moduleVersionTag' });

  const { moduleVersionTag: currentModuleVersionTag } = useParams({
    from: '/_auth/module-builder/$moduleId/$moduleVersionTag',
  });

  const handleOnSelectChanged = (selectedModuleVersionTag: string) => {
    navigate({
      to: '/module-builder/$moduleId/$moduleVersionTag',
      params: { moduleId, moduleVersionTag: selectedModuleVersionTag },
    });
  };

  return (
    <Container>
      <Flex>
        <UnControlledSelectField
          id="module-version-tag-select"
          name="module-version-tag-select"
          onChange={handleOnSelectChanged}
          multiple={false}
          render={(selectedItems) => {
            if (selectedItems.length > 0) {
              if (selectedItems[0].value === 'latest') {
                return (
                  <div>
                    <span>Latest version</span>
                  </div>
                );
              }
              return (
                <div>
                  <span>{selectedItems[0].value}</span>
                </div>
              );
            }
            return <span>Select a version</span>;
          }}
          value={currentModuleVersionTag}
          hasError={false}
          hasDescription={false}
        >
          <UnControlledSelectField.OptionGroup>
            {moduleVersions.map((moduleVersion) => {
              return (
                <UnControlledSelectField.Option
                  key={moduleVersion.id}
                  value={moduleVersion.tag}
                  label={moduleVersion.tag}
                >
                  <div>{moduleVersion.tag}</div>
                </UnControlledSelectField.Option>
              );
            })}
          </UnControlledSelectField.OptionGroup>
        </UnControlledSelectField>
      </Flex>
      <Flex>
        <span>{moduleName}</span>
        <CopyModulePopOver moduleId={moduleId} />
      </Flex>
      <div />
    </Container>
  );
};
