import {
  Alert,
  Button,
  Card,
  Dialog,
  Dropdown,
  IconButton,
  TextField,
  ValueConfirmationField,
  useTheme,
} from '@takaro/lib-components';
import { FC, MouseEvent, useState } from 'react';
import { Header, CardBody, Image } from './style';
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
}

const validationSchema = z.object({
  amount: z.number().int().positive().min(1),
});

export const ShopListingCard: FC<ShopListingCard> = ({ currencyName, gameServerId, shopListing, gameServerType }) => {
  const friendlyName = 'Listing';
  const theme = useTheme();
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
  const [valid, setValid] = useState<boolean>(false);
  const navigate = useNavigate();
  const { mutate: createShopOrderMutate, isPending: isPendingShopOrderCreate } = useShopOrderCreate();
  const { mutate: deleteShopListing } = useShopListingDelete();
  const { handleSubmit, control, watch } = useForm<z.infer<typeof validationSchema>>({
    mode: 'onSubmit',
    defaultValues: {
      amount: 1,
    },
  });

  const name = shopListing.name || shopListing.item.name;
  const hasPermission = useHasPermission(['MANAGE_SHOP_LISTINGS']);

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
    deleteShopListing({ id: shopListing.id });
    setOpenDeleteDialog(true);
  };

  const handleOnDelete = (e: MouseEvent) => {
    e.stopPropagation();
    setOpenDeleteDialog(false);
  };

  const handleOnBuyClick: SubmitHandler<z.infer<typeof validationSchema>> = ({ amount }) => {
    createShopOrderMutate({
      amount,
      listingId: shopListing.id,
    });
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
          {/* TODO: add default fallback icon */}
          <Image
            src={`/icons/${gameServerTypeToIconFolderMap[gameServerType]}/${shopListing.item.code}.png`}
            alt={`Item icon of ${shopListing.item.name}`}
            width="100%"
          />
          <h2>{name}</h2>
          <form onSubmit={handleSubmit(handleOnBuyClick)}>
            <TextField
              loading={isPendingShopOrderCreate}
              control={control}
              name="amount"
              type="number"
              placeholder="Enter amount"
              hasMargin={false}
            />
            <Button
              isLoading={isPendingShopOrderCreate}
              fullWidth
              text={`${
                watch('amount') == 0 ? shopListing.price * 1 : shopListing.price * watch('amount')
              } ${currencyName}`}
            />
          </form>
        </CardBody>
      </Card>

      <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <Dialog.Content>
          <Dialog.Heading>Delete shop listing</Dialog.Heading>
          <Dialog.Body size="medium">
            <Alert
              variant="info"
              text="You can hold down shift when deleting a shop listing to bypass this confirmation entirely."
            />
            <p>
              Are you sure you want to delete the shop listing? To confirm, type <strong>{friendlyName}</strong>.
            </p>
            <ValueConfirmationField
              value={friendlyName}
              onValidChange={(v) => setValid(v)}
              label="Shop listing"
              id="deleteShopListingConfirmation"
            />
            <Button onClick={handleOnDelete} disabled={!valid} fullWidth text="Delete shop listing" color="error" />
          </Dialog.Body>
        </Dialog.Content>
      </Dialog>
    </>
  );
};
