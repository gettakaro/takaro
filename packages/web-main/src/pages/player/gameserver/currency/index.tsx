import { FC, MouseEvent, useState } from 'react';
import { Card, Dropdown, Button } from '@takaro/lib-components';
import { PlayerOnGameserverOutputDTO } from '@takaro/apiclient';
import { CurrencyDialog } from './Dialog';
import { useOutletContext } from 'react-router-dom';

interface CurrencyProps {
  playerId: string;
  gameServerId: string;
}

export const Currency: FC<CurrencyProps> = () => {
  const [openAddCurrencyDialog, setOpenAddCurrencyDialog] = useState<boolean>(false);
  const [openRemoveCurrencyDialog, setOpenRemoveCurrencyDialog] = useState<boolean>(false);
  const { pog } = useOutletContext<{ pog: PlayerOnGameserverOutputDTO }>();

  if (!pog) {
    return null;
  }

  const handleAddCurrencyClick = (e: MouseEvent) => {
    e.stopPropagation();
    setOpenAddCurrencyDialog(true);
  };
  const handleAddCurrency = (currency: number) => {
    console.log(currency);
  };
  const handleRemoveCurrency = (currency: number) => {
    console.log(currency);
  };

  const handleRemoveCurrencyClick = (e: MouseEvent) => {
    e.stopPropagation();
    setOpenRemoveCurrencyDialog(true);
  };

  return (
    <>
      <Card variant="outline">
        <h2>Currency: {pog.currency}</h2>
        <Dropdown>
          <Dropdown.Trigger asChild>
            <Button text="actions" />
          </Dropdown.Trigger>
          <Dropdown.Menu>
            <Dropdown.Menu.Item onClick={handleAddCurrencyClick} label="Add currency" />
            <Dropdown.Menu.Item onClick={handleRemoveCurrencyClick} label="Remove currency" />
          </Dropdown.Menu>
        </Dropdown>
        <Card variant="default">Currency Graph placeholder</Card>
      </Card>
      <CurrencyDialog
        variant="add"
        open={openAddCurrencyDialog}
        setOpen={setOpenAddCurrencyDialog}
        onSubmit={handleAddCurrency}
      />
      <CurrencyDialog
        variant="deduct"
        open={openRemoveCurrencyDialog}
        setOpen={setOpenRemoveCurrencyDialog}
        onSubmit={handleRemoveCurrency}
      />
    </>
  );
};
