import { PlayerInventoryOutputDTO, PlayerOnGameserverOutputDTO } from '@takaro/apiclient';
import { useLocalStorage } from '@takaro/lib-components';
import { TableListToggleButton } from '../../../../components/TableListToggleButton';
import { FC } from 'react';
import { PlayerInventoryTableView } from './-PlayerInventoryTableView';
import { PlayerInventoryListView } from './-PlayerInventoryListView';

export interface IPlayerInventoryProps {
  pog: PlayerOnGameserverOutputDTO;
}

type ViewType = 'table' | 'list';

export const PlayerInventoryView: FC<IPlayerInventoryProps> = ({ pog }) => {
  const { setValue: setView, storedValue: view } = useLocalStorage<ViewType>('player-inventory-view', 'list');
  return (
    <>
      <TableListToggleButton onChange={setView} value={view} />
      {view === 'table' && (
        <PlayerInventoryTableView inventory={pog.inventory as unknown as PlayerInventoryOutputDTO} />
      )}
      {view === 'list' && <PlayerInventoryListView inventory={pog.inventory as unknown as PlayerInventoryOutputDTO} />}
    </>
  );
};
