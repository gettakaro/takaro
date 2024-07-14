import { Avatar, getInitials, SelectField, styled } from '@takaro/lib-components';
import { FC } from 'react';
import { CustomSelectProps } from '.';
import { playersQueryOptions } from 'queries/player';
import { useQuery } from '@tanstack/react-query';

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
  canClear,
  multiple,
}) => {
  const { data, isLoading: isLoadingData } = useQuery(playersQueryOptions());

  if (isLoadingData) {
    // TODO: better loading state
    return <div>loading...</div>;
  }

  if (!data?.data) {
    return <div>no players found</div>;
  }

  const players = data.data;

  return (
    <SelectField
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
      canClear={canClear}
      multiple={multiple}
      render={(selectedItems) => {
        if (selectedItems.length === 0) {
          return <div>Select...</div>;
        }
        const selectedPlayer = players.find((player) => player.id === selectedItems[0]?.value);
        return (
          <Inner>
            <Avatar size="tiny">
              <Avatar.Image src={selectedPlayer?.steamAvatar} alt={`Steam avatar ${name}`} />
              <Avatar.FallBack>{getInitials(selectedPlayer!.name)}</Avatar.FallBack>
            </Avatar>
            <div>{selectedPlayer!.name}</div>
          </Inner>
        );
      }}
    >
      <SelectField.OptionGroup>
        {players.map(({ name, id, steamAvatar }) => (
          <SelectField.Option key={`select-${name}`} value={id} label={name}>
            <Inner>
              <Avatar size="tiny">
                <Avatar.Image src={steamAvatar} alt={`Steam avatar ${name}`} />
                <Avatar.FallBack>{getInitials(name)}</Avatar.FallBack>
              </Avatar>
              <span>{name}</span>
            </Inner>
          </SelectField.Option>
        ))}
      </SelectField.OptionGroup>
    </SelectField>
  );
};
