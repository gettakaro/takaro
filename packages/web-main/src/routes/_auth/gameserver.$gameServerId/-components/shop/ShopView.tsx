import { FC } from 'react';
import { GameServerOutputDTOTypeEnum } from '@takaro/apiclient';
import { Alert, Chip, styled } from '@takaro/lib-components';
import { ShopTableView } from './ShopTableView';
import { ShopCardView } from './ShopCardView';
import { ViewSelector } from 'components/ViewSelector';

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

export const ShopView: FC<ShopViewProps> = ({ gameServerId, currency, currencyName, gameServerType }) => {
  // 0 is falsy!
  const hasCurrency = currency !== undefined;

  const tableView = (
    <ShopTableView
      gameServerId={gameServerId}
      currencyName={currencyName}
      currency={currency}
      gameServerType={gameServerType}
    />
  );

  const cardView = (
    <ShopCardView
      gameServerType={gameServerType}
      currencyName={currencyName}
      currency={currency}
      gameServerId={gameServerId}
    />
  );

  return (
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
          <Alert showIcon={false} variant="error" text={<p>You are not linked to this gameserver.</p>} />
        )}
      </Header>
      <ViewSelector id="shop" tableView={tableView} cardView={cardView} />
    </div>
  );
};
