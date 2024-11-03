import { FC } from 'react';
import { GameServerOutputDTOTypeEnum } from '@takaro/apiclient';
import { Alert, Button, Chip, Dropdown, styled, useLocalStorage } from '@takaro/lib-components';
import {
  AiOutlinePlus as CreateNewShopListingIcon,
  AiOutlineSplitCells as ImportShopListingFromGameServerIcon,
  AiOutlineUpload as ImportShopListingsFromFileIcon,
  AiOutlineDownload as ExportShopListingsToFileIcon,
  AiOutlineCheck as CheckMarkIcon,
} from 'react-icons/ai';
import { ShopTableView } from './ShopTableView';
import { ShopCardView } from './ShopCardView';
import { DropdownMenu } from '@takaro/lib-components/src/components/actions/Dropdown/DropdownMenu';
import { useNavigate } from '@tanstack/react-router';
import { useSnackbar } from 'notistack';
import { useQuery } from '@tanstack/react-query';
import { shopListingsQueryOptions } from 'queries/shopListing';
import { TableListToggleButton, ViewType } from 'components/TableListToggleButton';

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
  const navigate = useNavigate({ from: '/gameserver/$gameServerId/shop' });
  const { enqueueSnackbar } = useSnackbar();
  const { refetch } = useQuery({
    ...shopListingsQueryOptions({ filters: { gameServerId: [gameServerId] }, limit: 200 }),
    enabled: false,
  });
  const { setValue: setView, storedValue: view } = useLocalStorage<ViewType>('shop-view-selector', 'list');

  // 0 is falsy!
  const hasCurrency = currency !== undefined;

  const onClickCreateNewShopListing = () => {
    navigate({ to: '/gameserver/$gameServerId/shop/listing/create' });
  };

  const onClickImportShopListingsFromGameServer = () => {
    navigate({ to: '/gameserver/$gameServerId/shop/listing/import/gameserver' });
  };

  const onClickImportShopListingsFromFile = () => {
    navigate({ to: '/gameserver/$gameServerId/shop/listing/import/file' });
  };

  const onClickExportShopListingsToFile = async () => {
    const { data, error } = await refetch();

    if (error) {
      enqueueSnackbar({ variant: 'default', type: 'error', message: 'Failed to export shop listings!' });
    }

    if (data) {
      const blob = new Blob([JSON.stringify(data.data)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      enqueueSnackbar('Export ready for download', {
        autoHideDuration: 20000, // 20s
        anchorOrigin: { horizontal: 'right', vertical: 'bottom' },
        variant: 'drawer',
        children: (
          <div>
            <h4>ShopListings Ready</h4>
            <p>
              <CheckMarkIcon />{' '}
              <a href={url} download={'shoplistings.json'}>
                {' '}
                Download now
              </a>
            </p>
          </div>
        ),
      });
    }
  };

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
            <Alert variant="error" text={<p>You are not linked to this gameserver.</p>} />
          )}
        </Header>

        <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'row', gap: '10px' }}>
          <Dropdown>
            <Dropdown.Trigger asChild>
              <Button icon={<CreateNewShopListingIcon />} text="New shoplisting" />
            </Dropdown.Trigger>
            <Dropdown.Menu>
              <DropdownMenu.Group divider>
                <DropdownMenu.Item
                  icon={<CreateNewShopListingIcon />}
                  label="New shop listing"
                  onClick={onClickCreateNewShopListing}
                />
                <DropdownMenu.Item
                  icon={<ExportShopListingsToFileIcon />}
                  label="Export listings to file"
                  onClick={onClickExportShopListingsToFile}
                />
              </DropdownMenu.Group>
              <DropdownMenu.Group label="Import methods" divider>
                <DropdownMenu.Item
                  icon={<ImportShopListingFromGameServerIcon />}
                  label="Import listings from game server"
                  onClick={onClickImportShopListingsFromGameServer}
                />
                <DropdownMenu.Item
                  icon={<ImportShopListingsFromFileIcon />}
                  label="Import listings from file"
                  onClick={onClickImportShopListingsFromFile}
                />
              </DropdownMenu.Group>
            </Dropdown.Menu>
          </Dropdown>
          <TableListToggleButton value={view} onChange={setView} />
        </div>
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
