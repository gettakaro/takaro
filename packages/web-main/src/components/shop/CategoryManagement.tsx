import { FC } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { styled, Table, Button, DrawerSkeleton, Empty, EmptyPage, useTableActions } from '@takaro/lib-components';
import { AiOutlinePlus as AddIcon } from 'react-icons/ai';
import { createColumnHelper } from '@tanstack/react-table';
import { ShopCategoryOutputDTO } from '@takaro/apiclient';
import { useShopCategories } from '../../queries/shopCategories';
import { CategoryActions } from './CategoryActions';

const Container = styled.div`
  padding: ${({ theme }) => theme.spacing['2']};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing['2']};

  h1 {
    margin: 0;
    font-size: ${({ theme }) => theme.fontSize.large};
  }
`;

const CategoryPath = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing['0_5']};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSize.small};
`;

const EmojiDisplay = styled.span`
  font-size: 1.2em;
  margin-right: ${({ theme }) => theme.spacing['0_5']};
`;

interface CategoryManagementProps {
  gameServerId: string;
}

export const CategoryManagement: FC<CategoryManagementProps> = ({ gameServerId }) => {
  const navigate = useNavigate();
  const { data: categoriesData, isLoading, error } = useShopCategories();
  const { sorting, columnFilters, columnSearch } = useTableActions<ShopCategoryOutputDTO>();

  const handleBack = () => {
    navigate({ to: '/gameserver/$gameServerId/shop', params: { gameServerId: gameServerId } });
  };

  const handleCreate = () => {
    navigate({ to: '/gameserver/$gameServerId/shop/categories/create', params: { gameServerId: gameServerId } });
  };

  // Build hierarchical structure
  const buildCategoryTree = (categories: ShopCategoryOutputDTO[]): ShopCategoryOutputDTO[] => {
    const categoryMap = new Map<string, ShopCategoryOutputDTO>();
    const roots: ShopCategoryOutputDTO[] = [];

    // First pass: create map
    categories.forEach((cat) => {
      categoryMap.set(cat.id, { ...cat, children: [] });
    });

    // Second pass: build tree
    categories.forEach((cat) => {
      const category = categoryMap.get(cat.id)!;
      if (cat.parentId && categoryMap.has(cat.parentId)) {
        const parent = categoryMap.get(cat.parentId)!;
        if (!parent.children) parent.children = [];
        parent.children.push(category);
      } else {
        roots.push(category);
      }
    });

    return roots;
  };

  // Flatten tree for table display
  const flattenTree = (
    categories: ShopCategoryOutputDTO[],
    level = 0,
    parentPath = '',
  ): Array<ShopCategoryOutputDTO & { level: number; path: string }> => {
    const result: Array<ShopCategoryOutputDTO & { level: number; path: string }> = [];

    categories.forEach((cat) => {
      const path = parentPath ? `${parentPath} > ${cat.name}` : cat.name;
      result.push({ ...cat, level, path });

      if (cat.children && cat.children.length > 0) {
        result.push(...flattenTree(cat.children, level + 1, path));
      }
    });

    return result;
  };

  const columnHelper = createColumnHelper<ShopCategoryOutputDTO & { level: number; path: string }>();
  const columnDefs = [
    columnHelper.accessor('name', {
      header: 'Category',
      id: 'name',
      enableColumnFilter: false,
      cell: (info) => (
        <div style={{ paddingLeft: `${info.row.original.level * 2}rem` }}>
          <EmojiDisplay>{info.row.original.emoji}</EmojiDisplay>
          {info.getValue()}
        </div>
      ),
    }),
    columnHelper.accessor('path', {
      header: 'Path',
      id: 'path',
      enableColumnFilter: false,
      cell: (info) => <CategoryPath>{info.getValue()}</CategoryPath>,
    }),
    columnHelper.accessor('createdAt', {
      header: 'Created',
      id: 'createdAt',
      enableSorting: true,
      enableColumnFilter: false,
      cell: (info) => new Date(info.getValue()).toLocaleDateString(),
    }),
    columnHelper.display({
      header: 'Actions',
      id: 'actions',
      maxSize: 100,
      enableColumnFilter: false,
      cell: (info) => (
        <CategoryActions category={info.row.original as ShopCategoryOutputDTO} gameServerId={gameServerId} />
      ),
    }),
  ];

  if (isLoading) {
    return <DrawerSkeleton />;
  }

  if (error) {
    return (
      <EmptyPage>
        <Empty
          header="Failed to load categories"
          description="An error occurred while loading shop categories."
          actions={[
            <Button key="back" onClick={handleBack} variant="outline">
              Back to shop
            </Button>,
          ]}
        />
      </EmptyPage>
    );
  }

  const categories = categoriesData?.data || [];
  const categoryTree = buildCategoryTree(categories);
  const flatCategories = flattenTree(categoryTree);

  if (categories.length === 0) {
    return (
      <Container>
        <Header>
          <h1>Shop Categories</h1>
        </Header>
        <EmptyPage>
          <Empty
            header="No categories yet"
            description="Create your first category to organize shop listings."
            actions={[
              <Button key="create" onClick={handleCreate} icon={<AddIcon />}>
                Create category
              </Button>,
            ]}
          />
        </EmptyPage>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <h1>Shop Categories</h1>
        <Button onClick={handleCreate} icon={<AddIcon />}>
          Create category
        </Button>
      </Header>

      <Table
        id="categories-table"
        data={flatCategories}
        columns={columnDefs}
        sorting={sorting}
        columnFiltering={columnFilters}
        columnSearch={columnSearch}
      />
    </Container>
  );
};
