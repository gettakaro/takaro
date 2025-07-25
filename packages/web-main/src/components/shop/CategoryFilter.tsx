import { FC } from 'react';
import { styled, Skeleton, Button, UnControlledCheckBox } from '@takaro/lib-components';
import { useQuery } from '@tanstack/react-query';
import { shopCategoriesQueryOptions } from '../../queries/shopCategories';
import { ShopCategoryOutputDTO } from '@takaro/apiclient';

const Container = styled.div`
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: ${({ theme }) => theme.spacing['2']};
  min-width: 250px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing['2']};

  h3 {
    margin: 0;
    font-size: ${({ theme }) => theme.fontSize.large};
  }
`;

const CategoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing['0_5']};
`;

const CategoryItem = styled.div<{ depth: number }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing['1']};
  padding-left: ${({ theme, depth }) => `calc(${theme.spacing['2']} * ${depth})`};

  &:hover {
    background-color: ${({ theme }) => theme.colors.backgroundAccent};
    border-radius: ${({ theme }) => theme.borderRadius.small};
  }
`;

const CategoryLabel = styled.label`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing['0_5']};
  cursor: pointer;
  flex: 1;
  padding: ${({ theme }) => theme.spacing['0_5']};
  user-select: none;
`;

const CategoryCount = styled.span`
  color: ${({ theme }) => theme.colors.textAlt};
  font-size: ${({ theme }) => theme.fontSize.small};
`;

const ClearButton = styled(Button)`
  margin-top: ${({ theme }) => theme.spacing['1']};
  width: 100%;
`;

const SpecialFilter = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colors.backgroundAccent};
  margin-top: ${({ theme }) => theme.spacing['2']};
  padding-top: ${({ theme }) => theme.spacing['2']};
`;

interface CategoryFilterProps {
  selectedCategories: string[];
  onCategoryChange: (categoryIds: string[]) => void;
  showUncategorized?: boolean;
  onUncategorizedChange?: (show: boolean) => void;
  gameServerId?: string;
}

interface CategoryNodeProps {
  category: ShopCategoryOutputDTO;
  depth: number;
  selectedCategories: string[];
  onToggle: (categoryId: string) => void;
}

const CategoryNode: FC<CategoryNodeProps> = ({ category, depth, selectedCategories, onToggle }) => {
  const isSelected = selectedCategories.includes(category.id);
  const hasChildren = category.children && category.children.length > 0;

  const listingCount = category.listingCount || 0;

  return (
    <>
      <CategoryItem depth={depth}>
        <UnControlledCheckBox
          id={`category-${category.id}`}
          name={`category-${category.id}`}
          value={isSelected}
          onChange={() => onToggle(category.id)}
          hasDescription={false}
          hasError={false}
        />
        <CategoryLabel htmlFor={`category-${category.id}`}>
          <span>{category.emoji}</span>
          <span>{category.name}</span>
          <CategoryCount>({listingCount})</CategoryCount>
        </CategoryLabel>
      </CategoryItem>
      {hasChildren &&
        category.children?.map((child) => (
          <CategoryNode
            key={child.id}
            category={child}
            depth={depth + 1}
            selectedCategories={selectedCategories}
            onToggle={onToggle}
          />
        ))}
    </>
  );
};

export const CategoryFilter: FC<CategoryFilterProps> = ({
  selectedCategories,
  onCategoryChange,
  showUncategorized = false,
  onUncategorizedChange,
  gameServerId,
}) => {
  const { data: categoriesData, isLoading } = useQuery(
    shopCategoriesQueryOptions(
      {
        limit: 100,
        extend: ['children'],
      },
      gameServerId,
    ),
  );

  const handleCategoryToggle = (categoryId: string) => {
    const newSelection = selectedCategories.includes(categoryId)
      ? selectedCategories.filter((id) => id !== categoryId)
      : [...selectedCategories, categoryId];
    onCategoryChange(newSelection);
  };

  const handleClearAll = () => {
    onCategoryChange([]);
    if (onUncategorizedChange) {
      onUncategorizedChange(false);
    }
  };

  // Build a proper category tree from the flat array
  const buildCategoryTree = (categories: ShopCategoryOutputDTO[]): ShopCategoryOutputDTO[] => {
    // Create a map of all categories for quick lookup
    const categoryMap = new Map<string, ShopCategoryOutputDTO>();
    categories.forEach((cat) => {
      categoryMap.set(cat.id, { ...cat });
    });

    // Build the tree by assigning children to their parents
    const rootCategories: ShopCategoryOutputDTO[] = [];
    categories.forEach((cat) => {
      if (cat.parentId) {
        const parent = categoryMap.get(cat.parentId);
        if (parent) {
          if (!parent.children) {
            parent.children = [];
          }
          // Replace the child reference with the full category object
          const existingChildIndex = parent.children.findIndex((child) => child.id === cat.id);
          if (existingChildIndex >= 0) {
            parent.children[existingChildIndex] = categoryMap.get(cat.id)!;
          }
        }
      } else {
        rootCategories.push(categoryMap.get(cat.id)!);
      }
    });

    return rootCategories;
  };

  const rootCategories = categoriesData?.data ? buildCategoryTree(categoriesData.data) : [];

  return (
    <Container>
      <Header>
        <h3>Categories</h3>
      </Header>

      {isLoading ? (
        <>
          <Skeleton height="30px" width="100%" variant="text" />
          <Skeleton height="30px" width="100%" variant="text" />
          <Skeleton height="30px" width="100%" variant="text" />
        </>
      ) : (
        <>
          <CategoryList>
            {rootCategories.map((category) => (
              <CategoryNode
                key={category.id}
                category={category}
                depth={0}
                selectedCategories={selectedCategories}
                onToggle={handleCategoryToggle}
              />
            ))}
          </CategoryList>

          {onUncategorizedChange && (
            <SpecialFilter>
              <CategoryItem depth={0}>
                <UnControlledCheckBox
                  id="uncategorized"
                  name="uncategorized"
                  value={showUncategorized}
                  onChange={(e) => onUncategorizedChange(e.target.checked)}
                  hasDescription={false}
                  hasError={false}
                />
                <CategoryLabel htmlFor="uncategorized">
                  <span>📦</span>
                  <span>Uncategorized</span>
                </CategoryLabel>
              </CategoryItem>
            </SpecialFilter>
          )}

          {(selectedCategories.length > 0 || showUncategorized) && (
            <ClearButton variant="outline" size="small" onClick={handleClearAll}>
              Clear all filters
            </ClearButton>
          )}
        </>
      )}
    </Container>
  );
};
