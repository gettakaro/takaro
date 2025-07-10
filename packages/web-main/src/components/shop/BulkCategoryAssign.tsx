import { FC, useState } from 'react';
import { Dialog, Button, styled, Alert, Skeleton } from '@takaro/lib-components';
import { CategorySelector } from './CategorySelector';
import { useShopCategoryBulkAssign } from '../../queries/shopCategories';
import { useQuery } from '@tanstack/react-query';
import { shopListingsQueryOptions } from '../../queries/shopListing';
import { useSnackbar } from 'notistack';

const DialogBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing['2']};
`;

const ListingInfo = styled.div`
  padding: ${({ theme }) => theme.spacing['2']};
  background: ${({ theme }) => theme.colors.backgroundAccent};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
`;

const ListingList = styled.ul`
  margin: ${({ theme }) => theme.spacing['1']} 0;
  padding-left: ${({ theme }) => theme.spacing['3']};
  max-height: 150px;
  overflow-y: auto;
`;

const CategorySection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing['1']};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing['1']};
  justify-content: flex-end;
`;

interface BulkCategoryAssignProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedListingIds: string[];
  onSuccess?: () => void;
}

export const BulkCategoryAssign: FC<BulkCategoryAssignProps> = ({
  open,
  onOpenChange,
  selectedListingIds,
  onSuccess,
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [addCategoryIds, setAddCategoryIds] = useState<string[]>([]);
  const [removeCategoryIds, setRemoveCategoryIds] = useState<string[]>([]);

  const { mutate: bulkAssign, isPending } = useShopCategoryBulkAssign();

  // Fetch listing details for display
  const { data: listingsData, isLoading: listingsLoading } = useQuery({
    ...shopListingsQueryOptions({
      filters: { id: selectedListingIds },
      limit: selectedListingIds.length,
    }),
    enabled: open && selectedListingIds.length > 0,
  });

  const handleSubmit = () => {
    if (addCategoryIds.length === 0 && removeCategoryIds.length === 0) {
      enqueueSnackbar('Please select at least one category to add or remove', {
        variant: 'default',
        type: 'warning',
      });
      return;
    }

    bulkAssign(
      {
        bulkAssignDTO: {
          listingIds: selectedListingIds,
          addCategoryIds: addCategoryIds.length > 0 ? addCategoryIds : undefined,
          removeCategoryIds: removeCategoryIds.length > 0 ? removeCategoryIds : undefined,
        },
      },
      {
        onSuccess: () => {
          enqueueSnackbar('Categories updated successfully', {
            variant: 'default',
            type: 'success',
          });
          onOpenChange(false);
          onSuccess?.();
          // Reset state
          setAddCategoryIds([]);
          setRemoveCategoryIds([]);
        },
        onError: (error: any) => {
          const message = error?.response?.data?.meta?.error?.message || 'Failed to update categories';
          enqueueSnackbar(message, { variant: 'default', type: 'error' });
        },
      },
    );
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset state
    setAddCategoryIds([]);
    setRemoveCategoryIds([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content>
        <Dialog.Heading>Bulk Assign Categories</Dialog.Heading>
        <Dialog.Body>
          <DialogBody>
            <ListingInfo>
              <strong>Selected Listings ({selectedListingIds.length}):</strong>
              {listingsLoading ? (
                <Skeleton height="60px" variant="text" />
              ) : (
                <ListingList>
                  {listingsData?.data.map((listing) => (
                    <li key={listing.id}>{listing.name || listing.items[0]?.item.name || 'Unnamed listing'}</li>
                  ))}
                </ListingList>
              )}
            </ListingInfo>

            <Alert
              variant="info"
              text="Categories will be added or removed from all selected listings. Existing categories not mentioned will remain unchanged."
            />

            <CategorySection>
              <CategorySelector
                selectedCategoryIds={addCategoryIds}
                onChange={setAddCategoryIds}
                label="Add Categories"
                placeholder="Search categories to add..."
              />
            </CategorySection>

            <CategorySection>
              <CategorySelector
                selectedCategoryIds={removeCategoryIds}
                onChange={setRemoveCategoryIds}
                label="Remove Categories"
                placeholder="Search categories to remove..."
              />
            </CategorySection>

            {addCategoryIds.length > 0 && removeCategoryIds.some((id) => addCategoryIds.includes(id)) && (
              <Alert
                variant="warning"
                text="Some categories are selected for both adding and removing. The add operation will take precedence."
              />
            )}
          </DialogBody>
        </Dialog.Body>
        <ButtonGroup>
          <Button onClick={handleClose} variant="outline">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            isLoading={isPending}
            disabled={addCategoryIds.length === 0 && removeCategoryIds.length === 0}
          >
            Update Categories
          </Button>
        </ButtonGroup>
      </Dialog.Content>
    </Dialog>
  );
};
