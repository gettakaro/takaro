import { FC, MouseEvent, useState } from 'react';
import { Card, Dropdown, Button, Dialog, TextField, IconButton, LineChart } from '@takaro/lib-components';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { playerOnGameServerQueryOptions, useAddCurrency, useDeductCurrency } from 'queries/pog';
import { AiOutlineMenu as MenuIcon } from 'react-icons/ai';
import { CurrencyStatsQueryOptions } from 'queries/stats';
import { useQuery } from '@tanstack/react-query';
import { StatsOutputDTO } from '@takaro/apiclient';

interface CurrencyProps {
  economyEnabled: boolean;
  playerId: string;
  gameServerId: string;
}

export const Currency: FC<CurrencyProps> = ({ playerId, gameServerId, economyEnabled }) => {
  const { data: pog, isPending: isPendingPog } = useQuery(playerOnGameServerQueryOptions(gameServerId, playerId));
  const { data: currencyStats, isPending: isPendingCurrencyStats } = useQuery(
    CurrencyStatsQueryOptions(playerId, gameServerId),
  );

  if (isPendingPog || isPendingCurrencyStats) {
    return <div>Loading currency data</div>;
  }

  if (!pog || !currencyStats) {
    return <div>Player has not played on this gameserver</div>;
  }

  return (
    <CurrencyView
      playerId={playerId}
      gameServerId={gameServerId}
      currency={pog.currency}
      currencyStats={currencyStats}
      economyEnabled={economyEnabled}
    />
  );
};

interface CurrencyViewProps {
  playerId: string;
  gameServerId: string;
  currency: number;
  currencyStats: StatsOutputDTO;
  economyEnabled: boolean;
}

export const CurrencyView: FC<CurrencyViewProps> = ({
  currency,
  currencyStats,
  gameServerId,
  playerId,
  economyEnabled,
}) => {
  const [openAddCurrencyDialog, setOpenAddCurrencyDialog] = useState<boolean>(false);
  const [openDeductCurrencyDialog, setOpenDeductCurrencyDialog] = useState<boolean>(false);

  const { mutate: addCurrency, isPending: isAddingCurrency } = useAddCurrency();
  const { mutate: deductCurrency, isPending: isDeductingCurrency } = useDeductCurrency();

  const handleAddCurrencyClick = (e: MouseEvent) => {
    e.stopPropagation();
    setOpenAddCurrencyDialog(true);
  };

  const handleDeductCurrencyClick = (e: MouseEvent) => {
    e.stopPropagation();
    setOpenDeductCurrencyDialog(true);
  };

  const handleAddCurrency = (currency: number) => {
    addCurrency({ currency, playerId, gameServerId });
  };
  const handleDeductCurrency = (currency: number) => {
    deductCurrency({ currency, playerId, gameServerId });
  };

  return (
    <>
      <Card variant="outline">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
          }}
        >
          <h2>
            Currency:{' '}
            <strong
              style={{
                fontSize: '1.8rem',
              }}
            >
              {currency}
            </strong>
          </h2>
          <Dropdown>
            <Dropdown.Trigger asChild>
              <IconButton icon={<MenuIcon />} ariaLabel="Currency actions" />
            </Dropdown.Trigger>
            <Dropdown.Menu>
              <Dropdown.Menu.Item disabled={!economyEnabled} onClick={handleAddCurrencyClick} label="Add currency" />
              <Dropdown.Menu.Item
                disabled={!economyEnabled}
                onClick={handleDeductCurrencyClick}
                label="Deduct currency"
              />
            </Dropdown.Menu>
          </Dropdown>
        </div>
        <Card>
          <div style={{ height: '500px', position: 'relative' }}>
            <LineChart
              name="Currency"
              data={currencyStats.values as [number, number][]}
              xAccessor={(d) => new Date(d[0] * 1000)}
              yAccessor={(d) => d[1]}
              curveType="curveBasis"
            />
          </div>
        </Card>
      </Card>
      <CurrencyDialog
        variant="add"
        open={openAddCurrencyDialog}
        setOpen={setOpenAddCurrencyDialog}
        onSubmit={handleAddCurrency}
        isLoading={isAddingCurrency}
      />
      <CurrencyDialog
        variant="deduct"
        open={openDeductCurrencyDialog}
        setOpen={setOpenDeductCurrencyDialog}
        onSubmit={handleDeductCurrency}
        isLoading={isDeductingCurrency}
      />
    </>
  );
};

const currencySchema = z.object({
  currency: z.number().nonnegative(),
});

interface CurrencyDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onSubmit: (currency: number) => void;
  variant: 'add' | 'deduct';
  isLoading: boolean;
}

export const CurrencyDialog: FC<CurrencyDialogProps> = ({ onSubmit, variant, open, setOpen, isLoading }) => {
  const { handleSubmit, control } = useForm<z.infer<typeof currencySchema>>({
    resolver: zodResolver(currencySchema),
  });

  const submit: SubmitHandler<z.infer<typeof currencySchema>> = ({ currency }) => {
    onSubmit(currency);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Content>
        <Dialog.Heading>
          <span>{variant}: currency</span>
        </Dialog.Heading>
        <Dialog.Body>
          <p></p>
          <form onSubmit={handleSubmit(submit)}>
            <TextField placeholder="200" control={control} type="number" name="currency" label="Currency" />
            <Button fullWidth isLoading={isLoading} type="submit" text={`${variant} currency`} />
          </form>
        </Dialog.Body>
      </Dialog.Content>
    </Dialog>
  );
};
