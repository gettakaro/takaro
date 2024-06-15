import {
  Alert,
  Button,
  Card,
  Chip,
  Dialog,
  Dropdown,
  IconButton,
  TextField,
  ValueConfirmationField,
  useTheme,
} from '@takaro/lib-components';
import { FC, MouseEvent, useState } from 'react';
import { Header, CardBody, Image } from './style';
import bullets from './bullets.png';
import { useForm, SubmitHandler } from 'react-hook-form';

import {
  AiOutlineMenu as MenuIcon,
  AiOutlineEdit as EditIcon,
  AiOutlineDelete as DeleteIcon,
  AiOutlineEye as ViewIcon,
} from 'react-icons/ai';
import { z } from 'zod';

interface ShopListingCard {
  price: number;
  name: string;
  currencyName: string;
}

const validationSchema = z.object({
  amount: z.number().int().positive().min(1),
});

export const ShopListingCard: FC<ShopListingCard> = ({ price, name, currencyName }) => {
  const friendlyName = 'Listing';
  const theme = useTheme();
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [valid, setValid] = useState<boolean>(false);

  const { handleSubmit, control, watch } = useForm<z.infer<typeof validationSchema>>({
    mode: 'onSubmit',
    defaultValues: {
      amount: 1,
    },
  });

  const handleOnBuyClick = (e: MouseEvent) => {
    e.stopPropagation();
  };

  const handleOnEditClick = (e: MouseEvent) => {
    e.stopPropagation();
  };

  const handleOnViewClick = (e: MouseEvent) => {
    e.stopPropagation();
  };

  const handleOnDeleteClick = () => {};

  const handleOnDelete = (e: MouseEvent) => {
    e.stopPropagation();
    setOpenDialog(false);
  };

  const onSubmit: SubmitHandler<z.infer<typeof validationSchema>> = ({}) => {
    // todo buy item
  };

  return (
    <>
      <Card>
        <CardBody>
          <Header>
            <Chip variant="outline" color="primary" label="most popular" />
            <Dropdown>
              <Dropdown.Trigger asChild>
                <IconButton icon={<MenuIcon />} ariaLabel="Settings" />
              </Dropdown.Trigger>
              <Dropdown.Menu>
                <Dropdown.Menu.Item onClick={handleOnViewClick} icon={<ViewIcon />} label="View item" />
                <Dropdown.Menu.Item onClick={handleOnEditClick} icon={<EditIcon />} label="Update item" />
                <Dropdown.Menu.Item
                  onClick={handleOnDeleteClick}
                  icon={<DeleteIcon fill={theme.colors.error} />}
                  label="Delete listing"
                />
              </Dropdown.Menu>
            </Dropdown>
          </Header>
          <Image src={bullets} alt="bullets" width="100%" />
          <h2>{name}</h2>
          <form onSubmit={handleSubmit(onSubmit)}>
            <TextField control={control} name="amount" type="number" placeholder="Enter amount" hasMargin={false} />
            <Button
              fullWidth
              text={`Buy for ${watch('amount') == 0 ? price * 1 : price * watch('amount')} ${currencyName}`}
              onClick={handleOnBuyClick}
            />
          </form>
        </CardBody>
      </Card>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
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
