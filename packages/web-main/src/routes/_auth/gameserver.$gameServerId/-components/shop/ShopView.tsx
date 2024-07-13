import { GameServerOutputDTOTypeEnum } from '@takaro/apiclient';
import { FC, useState } from 'react';
import { ToggleButtonGroup } from '@takaro/lib-components';
import { AiOutlineTable as TableViewIcon, AiOutlineUnorderedList as ListViewIcon } from 'react-icons/ai';
import { ShopTableView } from './ShopTableView';
import { ShopCardView } from './ShopCardView';

export interface ShopViewProps {
  gameServerId: string;
  gameServerType: GameServerOutputDTOTypeEnum;
  currencyName: string;
  currency?: number;
}

type ViewType = 'list' | 'table';

export const ShopView: FC<ShopViewProps> = ({ gameServerId, currency, currencyName, gameServerType }) => {
  const [view, setView] = useState<ViewType>('list');

  return (
    <>
      <div
        style={{
          width: '100%',
          marginBottom: '10px',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
        }}
      >
        <ToggleButtonGroup
          onChange={(val) => setView(val as ViewType)}
          exclusive={true}
          orientation="horizontal"
          defaultValue={view}
        >
          <ToggleButtonGroup.Button value="list" tooltip="List view">
            <ListViewIcon size={24} />
          </ToggleButtonGroup.Button>
          <ToggleButtonGroup.Button value="table" tooltip="Table view">
            <TableViewIcon size={24} />
          </ToggleButtonGroup.Button>
        </ToggleButtonGroup>
      </div>

      {view === 'table' && (
        <ShopTableView
          gameServerId={gameServerId}
          currencyName={currencyName}
          currency={currency}
          gameServerType={gameServerType}
        />
      )}
      {view === 'list' && (
        <ShopCardView
          gameServerType={gameServerType}
          currencyName={currencyName}
          currency={currency}
          gameServerId={gameServerId}
        />
      )}
    </>
  );
};
