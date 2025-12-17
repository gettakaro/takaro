import { FC, MouseEvent, useState } from 'react';
import { Card, Dropdown, IconButton, LineChart } from '@takaro/lib-components';
import { playerOnGameServerQueryOptions } from '../../../../queries/pog';
import { AiOutlineMenu as MenuIcon } from 'react-icons/ai';
import { CurrencyStatsQueryOptions } from '../../../../queries/stats';
import { useQuery } from '@tanstack/react-query';
import { StatsOutputDTO } from '@takaro/apiclient';
import { PlayerCurrencyDialog } from '../../../../components/dialogs/PlayerCurrencyDialog';

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
  const [openCurrencyDialog, setOpenCurrencyDialog] = useState<boolean>(false);

  const handleCurrencyClick = (e: MouseEvent) => {
    e.stopPropagation();
    setOpenCurrencyDialog(true);
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
              <Dropdown.Menu.Item
                disabled={!economyEnabled}
                onClick={handleCurrencyClick}
                label="Add/Deduct currency"
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
              lines={[
                {
                  id: 'currency',
                  yAccessor: (d) => d[1],
                },
              ]}
              curveType="curveBasis"
            />
          </div>
        </Card>
      </Card>
      <PlayerCurrencyDialog
        open={openCurrencyDialog}
        onOpenChange={setOpenCurrencyDialog}
        playerId={playerId}
        gameServerId={gameServerId}
      />
    </>
  );
};
