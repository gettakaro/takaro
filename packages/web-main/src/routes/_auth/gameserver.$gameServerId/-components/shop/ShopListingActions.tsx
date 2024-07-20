import { FC, MouseEvent, useState } from 'react';
import { Button, Dialog, Dropdown, IconButton, useTheme } from '@takaro/lib-components';

import { useNavigate } from '@tanstack/react-router';
import {
  AiOutlineMenu as MenuIcon,
  AiOutlineEdit as EditIcon,
  AiOutlineDelete as DeleteIcon,
  AiOutlineEye as ViewIcon,
} from 'react-icons/ai';
import { useShopListingDelete } from 'queries/shopListing';

interface ShopListingActions {
  shopListingId: string;
  gameServerId: string;
  shopListingName: string;
}

export const ShopListingActions: FC<ShopListingActions> = ({ shopListingId, gameServerId, shopListingName }) => {
  const navigate = useNavigate();
  const [openDeleteConfirmationDialog, setOpenDeleteConfirmationDialog] = useState<boolean>(false);
  const { mutate: deleteShopListing } = useShopListingDelete();
  const theme = useTheme();

  const handleOnEditClick = (e: MouseEvent) => {
    e.stopPropagation();
    navigate({
      to: '/gameserver/$gameServerId/shop/listing/$shopListingId/update',
      params: { gameServerId, shopListingId },
    });
  };

  const handleOnViewClick = (e: MouseEvent) => {
    e.stopPropagation();
    navigate({
      to: '/gameserver/$gameServerId/shop/listing/$shopListingId/view',
      params: { gameServerId, shopListingId },
    });
  };

  const handleOnDeleteClick = () => {
    setOpenDeleteConfirmationDialog(true);
  };

  const handleOnDeleteConfirmationClick = (e: MouseEvent) => {
    e.stopPropagation();
    deleteShopListing({ shopListingId });
    setOpenDeleteConfirmationDialog(false);
  };

  return (
    <>
      <Dropdown>
        <Dropdown.Trigger asChild>
          <IconButton icon={<MenuIcon />} ariaLabel="Settings" />
        </Dropdown.Trigger>
        <Dropdown.Menu>
          <Dropdown.Menu.Item onClick={handleOnViewClick} icon={<ViewIcon />} label="View listing" />
          <Dropdown.Menu.Item onClick={handleOnEditClick} icon={<EditIcon />} label="Update listing" />
          <Dropdown.Menu.Item
            onClick={handleOnDeleteClick}
            icon={<DeleteIcon fill={theme.colors.error} />}
            label="Delete listing"
          />
        </Dropdown.Menu>
      </Dropdown>
      <Dialog open={openDeleteConfirmationDialog} onOpenChange={setOpenDeleteConfirmationDialog}>
        <Dialog.Content>
          <Dialog.Heading>Delete shop listing</Dialog.Heading>
          <Dialog.Body size="medium">
            <p>Are you sure you want to delete '{shopListingName}' from the shop?</p>
            <Button onClick={handleOnDeleteConfirmationClick} fullWidth text="Delete from shop" color="error" />
          </Dialog.Body>
        </Dialog.Content>
      </Dialog>
    </>
  );
};
