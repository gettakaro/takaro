import { FC } from 'react';
import { GameServerOutputDTOTypeEnum } from '@takaro/apiclient';
import { Chip, ToggleButtonGroup, styled, useLocalStorage } from '@takaro/lib-components';
import { AiOutlineTable as TableViewIcon, AiOutlineUnorderedList as ListViewIcon } from 'react-icons/ai';
import { ShopTableView } from './ShopTableView';
import { ShopCardView } from './ShopCardView';

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing['2']};
  strong {
    font-size: ${({ theme }) => theme.fontSize.medium};
    margin-right: ${({ theme }) => theme.spacing['0_5']};
  }
`;

export interface ShopViewProps {
  gameServerId: string;
  gameServerType: GameServerOutputDTOTypeEnum;
  currencyName: string;
  currency?: number;
}

type ViewType = 'list' | 'table';

export const ShopView: FC<ShopViewProps> = ({ gameServerId, currency, currencyName, gameServerType }) => {
  const { setValue: setView, storedValue: view } = useLocalStorage<ViewType>('shopview', 'list');

  // 0 is falsy!
  const hasCurrency = currency !== undefined;

  return (
    <>
      <div
        style={{
          width: '100%',
          marginBottom: '10px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Header>
          {hasCurrency ? (
            <Chip variant="outline" color="primary" label={`${currency} ${currencyName}`} />
          ) : (
            <Chip variant="outline" color="error" label="No player linked to this gameserver." />
          )}
        </Header>
        <ToggleButtonGroup
          onChange={(val) => setView(val as ViewType)}
          exclusive={true}
          orientation="horizontal"
          defaultValue={view}
        >
          <ToggleButtonGroup.Button value="list" tooltip="List view">
            <ListViewIcon size={20} />
          </ToggleButtonGroup.Button>
          <ToggleButtonGroup.Button value="table" tooltip="Table view">
            <TableViewIcon size={20} />
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
