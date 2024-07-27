import { PlayerOutputDTO } from '@takaro/apiclient';
import { Avatar, getInitials, SelectQueryField, styled } from '@takaro/lib-components';
import { FC, useState } from 'react';
import { CustomQuerySelectProps } from '.';
import { useQuery } from '@tanstack/react-query';
import { playersQueryOptions } from 'queries/player';

const Inner = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;

  & > span {
    margin-left: ${({ theme }) => theme.spacing['1']};
  }
`;

export const PlayerSelectQuery: FC<CustomQuerySelectProps> = ({
  control,
  name,
  hint,
  size,
  label,
  loading,
  disabled,
  inPortal,
  readOnly,
  required,
  hasMargin,
  description,
  placeholder = 'Select a player',
  multiple,
}) => {
  const [playerName, setPlayerName] = useState<string>('');

  const { data, isLoading: isLoadingPlayers } = useQuery(playersQueryOptions({ search: { name: [playerName] } }));
  const players = data?.data ?? [];

  return (
    <PlayerSelectQueryView
      control={control}
      players={players}
      name={name}
      readOnly={readOnly}
      description={description}
      size={size}
      disabled={disabled}
      inPortal={inPortal}
      hint={hint}
      multiple={multiple}
      hasMargin={hasMargin}
      placeholder={placeholder}
      required={required}
      loading={loading}
      label={label}
      setPlayerName={setPlayerName}
      isLoadingData={isLoadingPlayers}
    />
  );
};

export type PlayerSelectQueryViewProps = CustomQuerySelectProps & {
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
  hasMargin,
  multiple,
  inPortal,
  hint,
  required,
  loading,
  isLoadingData = false,
  setPlayerName,
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
      inPortal={inPortal}
      readOnly={readOnly}
      required={required}
      multiple={multiple}
      hasMargin={hasMargin}
      description={description}
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
