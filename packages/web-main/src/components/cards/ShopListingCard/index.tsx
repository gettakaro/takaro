import {
  Avatar,
  Button,
  Card,
  Dialog,
  Dropdown,
  IconButton,
  TextField,
  getInitials,
  useTheme,
} from '@takaro/lib-components';
import { FC, MouseEvent, useState } from 'react';
import { Header, CardBody } from './style';
import { useForm, SubmitHandler } from 'react-hook-form';

import {
  AiOutlineMenu as MenuIcon,
  AiOutlineEdit as EditIcon,
  AiOutlineDelete as DeleteIcon,
  AiOutlineEye as ViewIcon,
} from 'react-icons/ai';
import { z } from 'zod';
import { useNavigate } from '@tanstack/react-router';
import { useShopOrderCreate } from 'queries/shopOrder';
import { GameServerOutputDTOTypeEnum, ShopListingOutputDTO } from '@takaro/apiclient';
import { useHasPermission } from 'hooks/useHasPermission';
import { useShopListingDelete } from 'queries/shopListing';

const gameServerTypeToIconFolderMap = {
  [GameServerOutputDTOTypeEnum.Mock]: 'rust',
  [GameServerOutputDTOTypeEnum.Rust]: 'rust',
  [GameServerOutputDTOTypeEnum.Sevendaystodie]: '7d2d',
};

interface ShopListingCard {
  shopListing: ShopListingOutputDTO;
  currencyName: string;
  gameServerId: string;
  gameServerType: GameServerOutputDTOTypeEnum;
  currency: number;
}

const validationSchema = z.object({
  amount: z.number().int().positive().min(1),
});

export const ShopListingCard: FC<ShopListingCard> = ({
  currencyName,
  gameServerId,
  shopListing,
  gameServerType,
  currency,
}) => {
  const theme = useTheme();
  const [openDeleteConfirmationDialog, setOpenDeleteConfirmationDialog] = useState<boolean>(false);
  const [openBuyConfirmationDialog, setOpenBuyConfirmationDialog] = useState<boolean>(false);

  const navigate = useNavigate();
  const { mutateAsync: createShopOrderMutate, isPending: isPendingShopOrderCreate } = useShopOrderCreate();
  const { mutate: deleteShopListing } = useShopListingDelete();
  const { handleSubmit, control, watch } = useForm<z.infer<typeof validationSchema>>({
    mode: 'onSubmit',
    defaultValues: {
      amount: 1,
    },
  });

  const shopListingName = shopListing.name || shopListing.item.name;
  const hasPermission = useHasPermission(['MANAGE_SHOP_LISTINGS']);
  const price = watch('amount') == 0 ? shopListing.price * 1 : shopListing.price * watch('amount');

  const handleOnEditClick = (e: MouseEvent) => {
    e.stopPropagation();
    navigate({
      to: '/gameserver/$gameServerId/shop/listing/$shopListingId/update',
      params: { gameServerId, shopListingId: shopListing.id },
    });
  };

  const handleOnViewClick = (e: MouseEvent) => {
    e.stopPropagation();
    navigate({
      to: '/gameserver/$gameServerId/shop/listing/$shopListingId/view',
      params: { gameServerId, shopListingId: shopListing.id },
    });
  };

  const handleOnDeleteClick = () => {
    setOpenDeleteConfirmationDialog(true);
  };

  const handleOnDeleteConfirmationClick = (e: MouseEvent) => {
    e.stopPropagation();
    deleteShopListing({ id: shopListing.id });
    setOpenDeleteConfirmationDialog(false);
  };

  const handleOnBuyClick: SubmitHandler<z.infer<typeof validationSchema>> = () => {
    setOpenBuyConfirmationDialog(true);
  };

  const handleOnBuyConfirmationClick = () => {
    createShopOrderMutate({
      amount: watch('amount'),
      listingId: shopListing.id,
    });
    setOpenBuyConfirmationDialog(false);
  };

  return (
    <>
      <Card>
        <CardBody>
          <Header>
            {/*<Chip variant="outline" color="primary" label="most popular" />*/}
            {hasPermission && (
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
            )}
          </Header>
          <Avatar size="huge">
            <Avatar.Image
              src={`/icons/${gameServerTypeToIconFolderMap[gameServerType]}/${shopListing.item.code}.png`}
              alt={`Item icon of ${shopListing.item.name}`}
            />
            <Avatar.FallBack>{getInitials(shopListingName)}</Avatar.FallBack>
          </Avatar>
          <h2>{shopListingName}</h2>
          <form onSubmit={handleSubmit(handleOnBuyClick)}>
            <TextField
              loading={isPendingShopOrderCreate}
              control={control}
              name="amount"
              label="Amount"
              type="number"
              placeholder="Enter amount"
              hasMargin={false}
            />
            <Button
              isLoading={isPendingShopOrderCreate}
              fullWidth
              type="submit"
              disabled={currency < price}
              text={`${price} ${currencyName}`}
            />
          </form>
        </CardBody>
      </Card>
      <Dialog open={openBuyConfirmationDialog} onOpenChange={setOpenBuyConfirmationDialog}>
        <Dialog.Content>
          <Dialog.Heading>Confirm purchase: {shopListingName}</Dialog.Heading>
          <Dialog.Body size="medium">
            <p>
              Are you sure you want to purchase <strong>{shopListingName}</strong> for{' '}
              <strong>
                {price} {currencyName}
              </strong>
              ?
            </p>
            <Button onClick={handleOnBuyConfirmationClick} fullWidth text="confirm purchase" color="primary" />
          </Dialog.Body>
        </Dialog.Content>
      </Dialog>

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
