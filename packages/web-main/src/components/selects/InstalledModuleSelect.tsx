import { Select, styled } from '@takaro/lib-components';
import { FC } from 'react';
import { CustomSelectProps } from '.';
import { useGameServerModuleInstallations } from 'queries/gameservers';

const Inner = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;

  span {
    margin-left: ${({ theme }) => theme.spacing['1']};
  }
`;

type InstalledModuleSelectProps = CustomSelectProps & { gameServerId: string };

export const InstalledModuleSelect: FC<InstalledModuleSelectProps> = ({
  control,
  name,
  loading,
  description,
  readOnly,
  inPortal,
  disabled,
  label = 'Installed module',
  size,
  hint,
  gameServerId,
}) => {
  if (gameServerId === undefined) {
    throw new Error('InstalledModuleSelect: gameServerId is undefined');
  }

  const { data: modules, isLoading: isLoadingData } = useGameServerModuleInstallations(gameServerId);

  if (isLoadingData) {
    // TODO: better loading state
    return <div>loading...</div>;
  }

  if (!modules?.length) {
    return <div>no modules found</div>;
  }

  return (
    <Select
      control={control}
      name={name}
      label={label}
      description={description}
      readOnly={readOnly}
      hint={hint}
      disabled={disabled}
      size={size}
      inPortal={inPortal}
      loading={loading}
      render={(selectedIndex) => {
        if (selectedIndex === undefined || selectedIndex === -1) {
          return <div>Select...</div>;
        }
        return <div>{modules[selectedIndex].moduleId}</div>;
      }}
    >
      <Select.OptionGroup>
        {modules.map(({ id, moduleId }) => (
          <Select.Option key={`select-${name}-${id}`} value={moduleId}>
            <Inner>
              <span>{moduleId}</span>
            </Inner>
          </Select.Option>
        ))}
      </Select.OptionGroup>
    </Select>
  );
};
