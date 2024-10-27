import { createFileRoute } from '@tanstack/react-router';
import { PlayerCurrency } from './-PlayerCurrency';
import { gameServerSettingQueryOptions } from 'queries/setting';
import { PlayerInventoryTable } from './-PlayerInventoryTable';
import { playerOnGameServerQueryOptions } from 'queries/pog';
import { KickPlayerDialog } from 'components/KickPlayerDialog';
import { BanPlayerDialog } from 'components/BanPlayerDialog';
import { TeleportPlayerDialog } from 'components/TeleportPlayerDialog';
import { useUnbanPlayerOnGameServer } from 'queries/gameserver';
import { MouseEvent, useState } from 'react';
import { Button, Card, Dropdown, useTheme } from '@takaro/lib-components';
import {
  AiOutlineMenu as MenuIcon,
  AiOutlineClockCircle as KickIcon,
  AiOutlineStop as BanIcon,
  AiOutlineUndo as UnbanIcon,
  AiOutlineEnvironment as TeleportIcon,
} from 'react-icons/ai';
import { EventFeedWidget } from 'components/events/EventFeedWidget';

export const Route = createFileRoute('/_auth/_global/player/$playerId/$gameServerId')({
  loader: async ({ params, context }) => {
    const [economyEnabledSetting, pog] = await Promise.all([
      context.queryClient.ensureQueryData({ ...gameServerSettingQueryOptions('economyEnabled', params.gameServerId) }),
      context.queryClient.ensureQueryData({ ...playerOnGameServerQueryOptions(params.gameServerId, params.playerId) }),
    ]);
    return {
      pog,
      economyEnabledSetting: economyEnabledSetting?.value === 'true' ? true : false,
    };
  },
  component: Component,
});

function Component() {
  const { gameServerId, playerId } = Route.useParams();
  const { economyEnabledSetting, pog } = Route.useLoaderData();
  const [openKickPlayerDialog, setOpenKickPlayerDialog] = useState<boolean>(false);
  const [openBanPlayerDialog, setOpenBanPlayerDialog] = useState<boolean>(false);
  const [openTeleportPlayerDialog, setOpenTeleportPlayerDialog] = useState<boolean>(false);
  const theme = useTheme();

  const { mutate } = useUnbanPlayerOnGameServer();

  function handleOnKickPlayerClicked(e: MouseEvent) {
    e.stopPropagation();
    setOpenKickPlayerDialog(true);
  }

  function handleOnBanPlayerClicked(e: MouseEvent) {
    e.stopPropagation();
    setOpenBanPlayerDialog(true);
  }

  function handleOnTeleportPlayerClicked(e: MouseEvent) {
    e.stopPropagation();
    setOpenTeleportPlayerDialog(true);
  }

  function handleUnBanPlayerClicked() {
    mutate({ playerId, gameServerId });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <Dropdown>
        <Dropdown.Trigger asChild>
          <Button icon={<MenuIcon />} text="Actions" />
        </Dropdown.Trigger>
        <Dropdown.Menu>
          <Dropdown.Menu.Group divider>
            {/* teleport player should come on the map page */}
            <Dropdown.Menu.Item
              icon={<TeleportIcon />}
              label="Teleport player"
              onClick={handleOnTeleportPlayerClicked}
            />
          </Dropdown.Menu.Group>
          <Dropdown.Menu.Group>
            <Dropdown.Menu.Item icon={<KickIcon />} label="Kick player" onClick={handleOnKickPlayerClicked} />
            <Dropdown.Menu.Item
              icon={<BanIcon fill={theme.colors.error} />}
              label="Ban player"
              onClick={handleOnBanPlayerClicked}
            />
            <Dropdown.Menu.Item icon={<UnbanIcon />} label="Unban player" onClick={handleUnBanPlayerClicked} />
          </Dropdown.Menu.Group>
        </Dropdown.Menu>
      </Dropdown>

      <PlayerInventoryTable pog={pog} />
      <PlayerCurrency economyEnabled={economyEnabledSetting} gameServerId={gameServerId} playerId={playerId} />

      <Card variant="outline">
        <EventFeedWidget query={{ filters: { playerId: [playerId] } }} />
      </Card>

      <KickPlayerDialog
        gameServerId={gameServerId}
        playerId={playerId}
        open={openKickPlayerDialog}
        setOpen={setOpenKickPlayerDialog}
      />
      <BanPlayerDialog
        gameServerId={gameServerId}
        playerId={playerId}
        open={openBanPlayerDialog}
        setOpen={setOpenBanPlayerDialog}
      />
      <TeleportPlayerDialog
        gameServerId={gameServerId}
        playerId={playerId}
        open={openTeleportPlayerDialog}
        setOpen={setOpenTeleportPlayerDialog}
      />
    </div>
  );
}
