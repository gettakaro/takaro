import { FC, useState, useMemo } from 'react';
import { styled, Skeleton, Empty, UnControlledCheckBox } from '@takaro/lib-components';
import { ShopCategoryOutputDTO } from '@takaro/apiclient';
import { useShopCategories } from '../../queries/shopCategories';
import { AiOutlineSearch as SearchIcon } from 'react-icons/ai';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing['1']};
`;

const SearchContainer = styled.div`
  position: relative;
  margin-bottom: ${({ theme }) => theme.spacing['1']};
`;

const SearchIconWrapper = styled.div`
  position: absolute;
  left: ${({ theme }) => theme.spacing['1']};
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.text};
`;

const SearchInput = styled.input`
  padding-left: ${({ theme }) => theme.spacing['4']};
  width: 100%;
  padding: ${({ theme }) => theme.spacing['0_75']};
  border: 1px solid ${({ theme }) => theme.colors.backgroundAccent};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
`;

const CategoryList = styled.div`
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid ${({ theme }) => theme.colors.backgroundAccent};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: ${({ theme }) => theme.spacing['1']};
`;

const CategoryItem = styled.div<{ level: number }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing['0_5']};
  padding: ${({ theme }) => theme.spacing['0_5']};
  padding-left: ${({ theme, level }) => `calc(${theme.spacing['2']} * ${level})`};
  cursor: pointer;
  border-radius: ${({ theme }) => theme.borderRadius.small};

  &:hover {
    background: ${({ theme }) => theme.colors.backgroundAccent};
  }
`;

const CategoryLabel = styled.label`
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing['0_5']};
  flex: 1;
`;

const EmojiSpan = styled.span`
  font-size: 1.2em;
`;

const SelectedCount = styled.div`
  font-size: ${({ theme }) => theme.fontSize.small};
  color: ${({ theme }) => theme.colors.textAlt};
  margin-top: ${({ theme }) => theme.spacing['0_5']};
`;

interface CategorySelectorProps {
  selectedCategoryIds: string[];
  onChange: (categoryIds: string[]) => void;
  label?: string;
  error?: string;
  required?: boolean;
  placeholder?: string;
}

export const CategorySelector: FC<CategorySelectorProps> = ({
  selectedCategoryIds,
  onChange,
  label = 'Categories',
  error,
  required,
  placeholder = 'Search categories...',
}) => {
  const { data: categoriesData, isLoading, error: fetchError } = useShopCategories();
  const [searchTerm, setSearchTerm] = useState('');

  // Build hierarchical structure with filtered results
  const { filteredCategories } = useMemo(() => {
    if (!categoriesData?.data) return { filteredCategories: [], categoryMap: new Map() };

    const categories = categoriesData.data;
    const categoryMap = new Map<string, ShopCategoryOutputDTO>();

    // First pass: create map
    categories.forEach((cat) => {
      categoryMap.set(cat.id, { ...cat, children: [] });
    });

    // Second pass: build tree
    const roots: ShopCategoryOutputDTO[] = [];
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

    // Filter by search term
    const filterCategory = (cat: ShopCategoryOutputDTO): ShopCategoryOutputDTO | null => {
      const matchesSearch = !searchTerm || cat.name.toLowerCase().includes(searchTerm.toLowerCase());

      let filteredChildren: ShopCategoryOutputDTO[] = [];
      if (cat.children) {
        filteredChildren = cat.children
          .map((child) => filterCategory(child))
          .filter(Boolean) as ShopCategoryOutputDTO[];
      }

      // Include if matches search or has matching children
      if (matchesSearch || filteredChildren.length > 0) {
        return { ...cat, children: filteredChildren };
      }

      return null;
    };

    const filtered = roots.map((cat) => filterCategory(cat)).filter(Boolean) as ShopCategoryOutputDTO[];

    return { filteredCategories: filtered, categoryMap };
  }, [categoriesData, searchTerm]);

  // Flatten tree for display
  const flattenTree = (
    categories: ShopCategoryOutputDTO[],
    level = 0,
  ): Array<ShopCategoryOutputDTO & { level: number }> => {
    const result: Array<ShopCategoryOutputDTO & { level: number }> = [];

    categories.forEach((cat) => {
      result.push({ ...cat, level });
      if (cat.children && cat.children.length > 0) {
        result.push(...flattenTree(cat.children, level + 1));
      }
    });

    return result;
  };

  const flatCategories = useMemo(() => flattenTree(filteredCategories), [filteredCategories]);

  const handleCategoryToggle = (categoryId: string) => {
    if (selectedCategoryIds.includes(categoryId)) {
      onChange(selectedCategoryIds.filter((id) => id !== categoryId));
    } else {
      onChange([...selectedCategoryIds, categoryId]);
    }
  };

  if (isLoading) {
    return (
      <Container>
        <div>{label}</div>
        <Skeleton height="200px" variant="text" />
      </Container>
    );
  }

  if (fetchError || !categoriesData) {
    return (
      <Container>
        <div>{label}</div>
        <Empty header="Failed to load categories" description="Unable to fetch shop categories" actions={[]} />
      </Container>
    );
  }

  const allCategories = categoriesData.data || [];
  if (allCategories.length === 0) {
    return (
      <Container>
        <div>{label}</div>
        <Empty
          header="No categories available"
          description="Create categories first to assign them to listings"
          actions={[]}
        />
      </Container>
    );
  }

  return (
    <Container>
      <div>
        {label}
        {required && <span style={{ color: 'red' }}> *</span>}
      </div>

      <SearchContainer>
        <SearchIconWrapper>
          <SearchIcon />
        </SearchIconWrapper>
        <SearchInput value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder={placeholder} />
      </SearchContainer>

      <CategoryList>
        {flatCategories.length === 0 ? (
          <Empty header="No matching categories" description="Try a different search term" actions={[]} />
        ) : (
          flatCategories.map((category) => (
            <CategoryItem key={category.id} level={category.level}>
              <UnControlledCheckBox
                id={`category-${category.id}`}
                name={`category-${category.id}`}
                value={selectedCategoryIds.includes(category.id)}
                onChange={() => handleCategoryToggle(category.id)}
                hasDescription={false}
                hasError={false}
              />
              <CategoryLabel htmlFor={`category-${category.id}`}>
                <EmojiSpan>{category.emoji}</EmojiSpan>
                {category.name}
              </CategoryLabel>
            </CategoryItem>
          ))
        )}
      </CategoryList>

      <SelectedCount>
        {selectedCategoryIds.length} categor{selectedCategoryIds.length === 1 ? 'y' : 'ies'} selected
      </SelectedCount>

      {error && <div style={{ color: 'red', fontSize: '0.875rem' }}>{error}</div>}
    </Container>
  );
};
