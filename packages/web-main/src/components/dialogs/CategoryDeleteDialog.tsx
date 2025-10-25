import { forwardRef, MouseEvent, useImperativeHandle } from 'react';
import { DeleteImperativeHandle, RequiredDialogOptions } from '.';
import { Button, Dialog, FormError } from '@takaro/lib-components';
import { useShopCategoryDelete } from '../../queries/shopCategories';
import { ShopCategoryOutputDTO } from '@takaro/apiclient';

interface CategoryDeleteDialogProps extends RequiredDialogOptions {
  category: ShopCategoryOutputDTO;
}

export const CategoryDeleteDialog = forwardRef<DeleteImperativeHandle, CategoryDeleteDialogProps>(
  function CategoryDeleteDialog({ category, ...dialogOptions }, ref) {
    const { mutate, isPending: isDeleting, isSuccess, error } = useShopCategoryDelete();

    useImperativeHandle(ref, () => ({
      triggerDelete: () => mutate({ shopCategoryId: category.id }),
    }));

    const handleOnDelete = (e: MouseEvent) => {
      e.stopPropagation();
      mutate({ shopCategoryId: category.id });
    };

    if (isSuccess) {
      dialogOptions.onOpenChange(false);
    }

    return (
      <Dialog {...dialogOptions}>
        <Dialog.Content>
          <Dialog.Heading>delete: category</Dialog.Heading>
          <Dialog.Body>
            <>
              <p>
                Are you sure you want to delete the category "{category.emoji} {category.name}"?
              </p>
              {category.listingCount !== undefined && category.listingCount > 0 && (
                <p>
                  <strong>Warning:</strong> This category has {category.listingCount} shop listing
                  {category.listingCount > 1 ? 's' : ''} associated with it.
                </p>
              )}
              {category.children && category.children.length > 0 && (
                <p>
                  <strong>Note:</strong> This category has {category.children.length} sub-categor
                  {category.children.length > 1 ? 'ies' : 'y'} that will be moved to the root level.
                </p>
              )}
            </>
            {error && <FormError error={error} />}
            <Button onClick={handleOnDelete} color="error" isLoading={isDeleting} fullWidth>
              Delete category
            </Button>
          </Dialog.Body>
        </Dialog.Content>
      </Dialog>
    );
  },
);
