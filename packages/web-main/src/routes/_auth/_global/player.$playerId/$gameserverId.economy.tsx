import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { Currency } from './-PlayerCurrency';
import { gameServerSettingQueryOptions } from 'queries/setting';
import { Alert } from '@takaro/lib-components';

export const Route = createFileRoute('/_auth/_global/player/$playerId/$gameserverId/economy')({
  component: Component,
});

function Component() {
  const { playerId, gameserverId } = Route.useParams();

  const { data: economyEnabledSetting } = useQuery({
    ...gameServerSettingQueryOptions('economyEnabled', gameserverId),
  });
  const economyEnabled = economyEnabledSetting?.value === 'true' ? true : false;

  return (
    <>
      {!economyEnabled && (
        <Alert
          variant="info"
          text="Economy is disabled for this server, some actions will be unavailable. To enable economy, go to the game server settings."
          dismiss
        />
      )}
      {<Currency playerId={playerId} gameServerId={gameserverId} economyEnabled={economyEnabled} />}
    </>
  );
}
