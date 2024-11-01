import { PlayerOutputDTO } from '@takaro/apiclient';
import { Avatar, getInitials, PaginationProps, SelectQueryField, styled } from '@takaro/lib-components';
import { FC, useState } from 'react';
import { CustomSelectQueryProps } from '.';
import { useInfiniteQuery } from '@tanstack/react-query';
import { playersInfiniteQueryOptions } from 'queries/player';

const Inner = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;

  & > span {
    margin-left: ${({ theme }) => theme.spacing['1']};
  }
`;

export const PlayerSelectQueryField: FC<CustomSelectQueryProps> = ({
  control,
  name,
  hint,
  size,
  label,
  loading,
  disabled,
  readOnly,
  required,
  description,
  placeholder,
  multiple,
}) => {
  const [playerName, setPlayerName] = useState<string>('');

  const {
    data,
    isLoading: isLoadingPlayers,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteQuery(playersInfiniteQueryOptions({ search: { name: [playerName] }, limit: 20 }));

  const players = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <PlayerSelectQueryView
      control={control}
      players={players}
      name={name}
      readOnly={readOnly}
      description={description}
      size={size}
      disabled={disabled}
      hint={hint}
      multiple={multiple}
      placeholder={placeholder}
      required={required}
      loading={loading}
      label={label}
      setPlayerName={setPlayerName}
      isLoadingData={isLoadingPlayers}
      isFetchingNextPage={isFetchingNextPage}
      isFetching={isFetching}
      hasNextPage={hasNextPage}
      fetchNextPage={fetchNextPage}
    />
  );
};

export type PlayerSelectQueryViewProps = CustomSelectQueryProps &
  PaginationProps & {
    players: PlayerOutputDTO[];
    isLoadingData?: boolean;
    setPlayerName: (value: string) => void;
  };
export const PlayerSelectQueryView: FC<PlayerSelectQueryViewProps> = ({
  control,
  players,
  name: selectName,
  readOnly,
  description,
  size,
  disabled,
  placeholder,
  multiple,
  hint,
  required,
  loading,
  isLoadingData = false,
  setPlayerName,
  isFetching,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
  label,
}) => {
  return (
    <SelectQueryField
      name={selectName}
      debounce={500}
      hint={hint}
      label={label}
      size={size}
      loading={loading}
      isLoadingData={isLoadingData}
      disabled={disabled}
      readOnly={readOnly}
      required={required}
      multiple={multiple}
      description={description}
      isFetching={isFetching}
      hasNextPage={hasNextPage}
      fetchNextPage={fetchNextPage}
      isFetchingNextPage={isFetchingNextPage}
      render={(selectedPlayers) => {
        if (selectedPlayers.length === 0) {
          return <div>Select Player...</div>;
        }

        if (selectedPlayers.length === 1) {
          const selectedPlayer = players.find((player) => player.id === selectedPlayers[0]?.value);

          if (selectedPlayer) {
            return (
              <Inner>
                <Avatar size="tiny">
                  <Avatar.Image src={selectedPlayer.steamAvatar} alt={`Steam avatar ${selectedPlayer.name}`} />
                  <Avatar.FallBack>{getInitials(selectedPlayer.name)}</Avatar.FallBack>
                </Avatar>
                <div>{selectedPlayer.name}</div>
              </Inner>
            );
          }
        }
        return <div>{selectedPlayers.map((item) => item.label).join(', ')}</div>;
      }}
      placeholder={placeholder}
      handleInputValueChange={(value) => setPlayerName(value)}
      control={control}
    >
      <SelectQueryField.OptionGroup label="options">
        {players.map((player) => (
          <SelectQueryField.Option key={selectName + '-' + player.id} value={player.id} label={player.name}>
            <Inner>
              <Avatar size="tiny">
                <Avatar.Image src={player.steamAvatar} alt={`Steam avatar ${player.name}`} />
                <Avatar.FallBack>{getInitials(player.name)}</Avatar.FallBack>
              </Avatar>
              <span>{player.name}</span>
            </Inner>
          </SelectQueryField.Option>
        ))}
      </SelectQueryField.OptionGroup>
    </SelectQueryField>
  );
};
