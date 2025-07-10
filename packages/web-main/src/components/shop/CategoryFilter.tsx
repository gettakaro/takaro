import { FC, useState } from 'react';
import { styled, Skeleton, Button } from '@takaro/lib-components';
import { useQuery } from '@tanstack/react-query';
import { shopCategoriesQueryOptions } from '../../queries/shopCategories';
import { ShopCategoryOutputDTO } from '@takaro/apiclient';
import { AiOutlineDown as DownIcon, AiOutlineRight as RightIcon } from 'react-icons/ai';

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
  cursor: pointer;

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

  // TODO: Get actual listing count from API
  const listingCount = 0;

  return (
    <>
      <CategoryItem depth={depth}>
        <input
          type="checkbox"
          id={`category-${category.id}`}
          value={category.id}
          name="category"
          checked={isSelected}
          onChange={() => onToggle(category.id)}
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
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const { data: categoriesData, isLoading } = useQuery(
    shopCategoriesQueryOptions({
      limit: 100,
      extend: ['children'],
    }),
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

  const rootCategories = categoriesData?.data.filter((cat) => !cat.parentId) || [];

  return (
    <Container>
      <Header onClick={() => setIsExpanded(!isExpanded)}>
        <h3>Categories</h3>
        {isExpanded ? <DownIcon /> : <RightIcon />}
      </Header>

      {isExpanded &&
        (isLoading ? (
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
                  <input
                    type="checkbox"
                    id="uncategorized"
                    value="uncategorized"
                    name="uncategorized"
                    checked={showUncategorized}
                    onChange={(e) => onUncategorizedChange(e.target.checked)}
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
        ))}
    </Container>
  );
};
