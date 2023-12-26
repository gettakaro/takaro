import { Avatar, getInitials, Select, styled } from '@takaro/lib-components';
import { FC } from 'react';
import { CustomSelectProps } from '.';
import { usePlayers } from 'queries/players';

const Inner = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;

  span {
    margin-left: ${({ theme }) => theme.spacing['1']};
  }
`;

export const PlayerSelect: FC<CustomSelectProps> = ({
  control,
  name,
  label = 'Player',
  loading,
  description,
  readOnly,
  inPortal,
  disabled,
  size,
  required,
  hint,
}) => {
  const { data, isLoading: isLoadingData } = usePlayers();

  if (isLoadingData) {
    // TODO: better loading state
    return <div>loading...</div>;
  }

  if (!data?.data) {
    return <div>no players found</div>;
  }

  const players = data.data;

  return (
    <Select
      control={control}
      name={name}
      label={label}
      description={description}
      readOnly={readOnly}
      hint={hint}
      required={required}
      disabled={disabled}
      size={size}
      inPortal={inPortal}
      enableFilter
      loading={loading}
      render={(selectedIndex) => {
        if (selectedIndex === undefined || selectedIndex === -1) {
          return <div>Select...</div>;
        }
        return (
          <Inner>
            {players[selectedIndex].steamAvatar ? (
              <Avatar size="tiny" src={players[selectedIndex].steamAvatar} alt={`Steam avatar ${name}`} />
            ) : (
              <Avatar size="tiny" alt={name}>
                {getInitials(name)}
              </Avatar>
            )}
            <div>{players[selectedIndex].name}</div>
          </Inner>
        );
      }}
    >
      <Select.OptionGroup>
        {players.map(({ name, id, steamAvatar }) => (
          <Select.Option key={`select-${name}`} value={id} label={name}>
            <Inner>
              {steamAvatar ? (
                <Avatar size="tiny" src={steamAvatar} alt={`Steam avatar ${name}`} />
              ) : (
                <Avatar size="tiny" alt={name}>
                  {getInitials(name)}
                </Avatar>
              )}
              <span>{name}</span>
            </Inner>
          </Select.Option>
        ))}
      </Select.OptionGroup>
    </Select>
  );
};
