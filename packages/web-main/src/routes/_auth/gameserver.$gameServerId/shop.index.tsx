import { createFileRoute } from '@tanstack/react-router';
import { gameServerSettingQueryOptions } from 'queries/setting';
import { playerOnGameServerQueryOptions } from 'queries/pog';
import { gameServerQueryOptions } from 'queries/gameserver';
import { ShopCardView } from './-components/ShopCardView';
import { useState } from 'react';
import { ToggleButtonGroup } from '@takaro/lib-components';

import { AiOutlineTable as TableViewIcon, AiOutlineUnorderedList as ListViewIcon } from 'react-icons/ai';
import { ShopTableView } from './-components/ShopTableView';

export const Route = createFileRoute('/_auth/gameserver/$gameServerId/shop/')({
  loader: async ({ context, params }) => {
    const session = await context.auth.getSession();

    const [currencyName, gameServer, pog] = await Promise.all([
      context.queryClient.ensureQueryData(gameServerSettingQueryOptions('currencyName', params.gameServerId)),
      context.queryClient.ensureQueryData(gameServerQueryOptions(params.gameServerId)),
      session.playerId &&
        context.queryClient.ensureQueryData(playerOnGameServerQueryOptions(params.gameServerId, session.playerId)),
    ]);

    return {
      currencyName: currencyName.value,
      gameServer: gameServer,
      currency: pog ? pog.currency : undefined,
    };
  },
  component: Component,
});

type ViewType = 'list' | 'table';

function Component() {
  const { currencyName, gameServer, currency } = Route.useLoaderData();
  const { gameServerId } = Route.useParams();
  const [view, setView] = useState<ViewType>('list');

  return (
    <>
      <div
        style={{
          width: '100%',
          marginBottom: '10px',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
        }}
      >
        <ToggleButtonGroup
          onChange={(val) => setView(val as ViewType)}
          exclusive={true}
          orientation="horizontal"
          defaultValue={view}
        >
          <ToggleButtonGroup.Button value="list" tooltip="List view">
            <ListViewIcon size={24} />
          </ToggleButtonGroup.Button>
          <ToggleButtonGroup.Button value="table" tooltip="Table view">
            <TableViewIcon size={24} />
          </ToggleButtonGroup.Button>
        </ToggleButtonGroup>
      </div>

      {view === 'table' && (
        <ShopTableView
          gameServerId={gameServer.id}
          currencyName={currencyName}
          currency={currency}
          gameServerType={gameServer.type}
        />
      )}
      {view === 'list' && (
        <ShopCardView
          gameServerType={gameServer.type}
          currencyName={currencyName}
          currency={currency}
          gameServerId={gameServerId}
        />
      )}
    </>
  );
}
