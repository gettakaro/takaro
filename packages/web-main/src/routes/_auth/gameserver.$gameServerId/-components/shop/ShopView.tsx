import { FC, useState, useEffect } from 'react';
import { GameServerOutputDTOTypeEnum } from '@takaro/apiclient';
import { Alert, Button, Chip, Dropdown, styled, useLocalStorage } from '@takaro/lib-components';
import {
  AiOutlineMenu as MenuIcon,
  AiOutlinePlus as CreateNewShopListingIcon,
  AiOutlineSplitCells as ImportShopListingFromGameServerIcon,
  AiOutlineUpload as ImportShopListingsFromFileIcon,
  AiOutlineDownload as ExportShopListingsToFileIcon,
  AiOutlineCheck as CheckMarkIcon,
  AiOutlineBook as DocumentationIcon,
  AiOutlineTag as CategoryIcon,
  AiOutlineClose as ClearSelectionIcon,
} from 'react-icons/ai';
import { ShopTableView } from './ShopTableView';
import { ShopCardView } from './ShopCardView';
import { DropdownMenu } from '@takaro/lib-components/src/components/actions/Dropdown/DropdownMenu';
import { useNavigate } from '@tanstack/react-router';
import { useSnackbar } from 'notistack';
import { useQuery } from '@tanstack/react-query';
import { shopListingsQueryOptions } from '../../../../../queries/shopListing';
import { TableListToggleButton, ViewType } from '../../../../../components/TableListToggleButton';
import { PermissionsGuard } from '../../../../../components/PermissionsGuard';
import { CategoryFilter } from '../../../../../components/shop/CategoryFilter';
import { BulkCategoryAssign } from '../../../../../components/shop/BulkCategoryAssign';

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing['2']};
  strong {
    font-size: ${({ theme }) => theme.fontSize.medium};
    margin-right: ${({ theme }) => theme.spacing['0_5']};
  }
`;

const ShopLayout = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing['2']};
`;

const ShopContent = styled.div`
  flex: 1;
`;

const BulkActionBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing['2']};
  background: ${({ theme }) => theme.colors.backgroundAccent};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  margin-bottom: ${({ theme }) => theme.spacing['2']};
  gap: ${({ theme }) => theme.spacing['2']};
`;

const SelectionInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing['1']};
  font-size: ${({ theme }) => theme.fontSize.medium};
`;

const BulkActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing['1']};
`;

export interface ShopViewProps {
  gameServerId: string;
  gameServerType: GameServerOutputDTOTypeEnum;
  currencyName: string;
  currency?: number;
  selectedCategories?: string[];
  showUncategorized?: boolean;
  onCategoryClick?: (categoryId: string) => void;
  selectedListingIds?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
}

export const ShopView: FC<ShopViewProps> = ({ gameServerId, currency, currencyName, gameServerType }) => {
  const navigate = useNavigate({ from: '/gameserver/$gameServerId/shop' });
  const { enqueueSnackbar } = useSnackbar();

  // Load filter state from sessionStorage
  const sessionKey = `shop-filters-${gameServerId}`;
  const loadSessionFilters = () => {
    try {
      const stored = sessionStorage.getItem(sessionKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          selectedCategories: parsed.selectedCategories || [],
          showUncategorized: parsed.showUncategorized || false,
        };
      }
    } catch (e) {
      console.error('Failed to load session filters:', e);
    }
    return { selectedCategories: [], showUncategorized: false };
  };

  const { selectedCategories: initialCategories, showUncategorized: initialUncategorized } = loadSessionFilters();
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialCategories);
  const [showUncategorized, setShowUncategorized] = useState(initialUncategorized);
  const [selectedListingIds, setSelectedListingIds] = useState<string[]>([]);
  const [bulkAssignOpen, setBulkAssignOpen] = useState(false);

  // Save filters to sessionStorage whenever they change
  useEffect(() => {
    try {
      sessionStorage.setItem(
        sessionKey,
        JSON.stringify({
          selectedCategories,
          showUncategorized,
        }),
      );
    } catch (e) {
      console.error('Failed to save session filters:', e);
    }
  }, [selectedCategories, showUncategorized, sessionKey]);

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    );
  };

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
  const onClickViewDocumentation = () => {
    window.open('https://docs.takaro.io/economy', '_blank');
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
            <Alert variant="error" text={<p>You are not linked to this game server.</p>} />
          )}
        </Header>

        <PermissionsGuard requiredPermissions={['MANAGE_SHOP_LISTINGS']}>
          <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'row', gap: '10px' }}>
            <Dropdown>
              <Dropdown.Trigger asChild>
                <Button icon={<MenuIcon />}>Shop actions</Button>
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
                  <DropdownMenu.Item
                    icon={<DocumentationIcon />}
                    label="View Economy Documentation"
                    onClick={onClickViewDocumentation}
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
        </PermissionsGuard>
      </div>

      <ShopLayout>
        <CategoryFilter
          selectedCategories={selectedCategories}
          onCategoryChange={setSelectedCategories}
          showUncategorized={showUncategorized}
          onUncategorizedChange={setShowUncategorized}
        />

        <ShopContent>
          {view === 'table' && selectedListingIds.length > 0 && (
            <BulkActionBar>
              <SelectionInfo>
                <strong>{selectedListingIds.length}</strong> listing{selectedListingIds.length > 1 ? 's' : ''} selected
              </SelectionInfo>
              <BulkActions>
                <Button icon={<CategoryIcon />} onClick={() => setBulkAssignOpen(true)} size="small">
                  Assign Categories
                </Button>
                <Button
                  icon={<ClearSelectionIcon />}
                  onClick={() => setSelectedListingIds([])}
                  variant="outline"
                  size="small"
                >
                  Clear Selection
                </Button>
              </BulkActions>
            </BulkActionBar>
          )}
          {view === 'table' && (
            <ShopTableView
              gameServerId={gameServerId}
              currencyName={currencyName}
              currency={currency}
              gameServerType={gameServerType}
              selectedCategories={selectedCategories}
              showUncategorized={showUncategorized}
              selectedListingIds={selectedListingIds}
              onSelectionChange={setSelectedListingIds}
            />
          )}
          {view === 'list' && (
            <ShopCardView
              gameServerType={gameServerType}
              currencyName={currencyName}
              currency={currency}
              gameServerId={gameServerId}
              selectedCategories={selectedCategories}
              showUncategorized={showUncategorized}
              onCategoryClick={handleCategoryClick}
            />
          )}
        </ShopContent>
      </ShopLayout>

      <BulkCategoryAssign
        open={bulkAssignOpen}
        onOpenChange={setBulkAssignOpen}
        selectedListingIds={selectedListingIds}
        onSuccess={() => setSelectedListingIds([])}
      />
    </>
  );
};
