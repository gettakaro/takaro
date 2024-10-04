import { createFileRoute } from '@tanstack/react-router';
import { Section } from './-style';
import { PlayerInventoryTable } from './-PlayerInventoryTable';
import { playerOnGameServerQueryOptions } from 'queries/pog';
import { Dropdown, IconButton } from '@takaro/lib-components';
import {
  AiOutlineMenu as MenuIcon,
  AiOutlinePlus as GiveItemIcon,
  AiOutlineClockCircle as KickIcon,
  AiOutlineStop as BanIcon,
  AiOutlineUndo as UnbanIcon,
  AiOutlineEnvironment as TeleportIcon,
} from 'react-icons/ai';
import { MouseEvent, useState } from 'react';
import { GiveItemDialog } from 'components/GiveItemDialog';
import { KickPlayerDialog } from 'components/KickPlayerDialog';
import { BanPlayerDialog } from 'components/BanPlayerDialog';
import { TeleportPlayerDialog } from 'components/TeleportPlayerDialog';
import { useUnbanPlayerOnGameServer } from 'queries/gameserver';

export const Route = createFileRoute('/_auth/_global/player/$playerId/$gameserverId/inventory')({
  component: Component,

  loader: async ({ context, params }) => {
    return await context.queryClient.ensureQueryData(
      playerOnGameServerQueryOptions(params.gameserverId, params.playerId),
    );
  },
});

function Component() {
  const pog = Route.useLoaderData();
  const { gameserverId: gameServerId, playerId } = Route.useParams();
  const [openGiveItemDialog, setOpenGiveItemDialog] = useState(false);
  const [openKickPlayerDialog, setOpenKickPlayerDialog] = useState(false);
  const [openBanPlayerDialog, setOpenBanPlayerDialog] = useState(false);
  const [openTeleportPlayerDialog, setOpenTeleportPlayerDialog] = useState(false);
  const { mutate } = useUnbanPlayerOnGameServer();

  function handleOnGiveItemClicked(e: MouseEvent) {
    e.stopPropagation();
    setOpenGiveItemDialog(true);
  }

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

  function unBanPlayerClicked() {
    mutate({ playerId, gameServerId });
  }

  return (
    <Section style={{ minHeight: '250px' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2>Inventory</h2>
        <Dropdown>
          <Dropdown.Trigger asChild>
            <IconButton icon={<MenuIcon />} ariaLabel="Actions" />
          </Dropdown.Trigger>
          <Dropdown.Menu>
            <Dropdown.Menu.Group>
              <Dropdown.Menu.Item icon={<GiveItemIcon />} label="Give item" onClick={handleOnGiveItemClicked} />
              {/* teleport player should come on the map page */}
              <Dropdown.Menu.Item
                icon={<TeleportIcon />}
                label="Teleport player"
                onClick={handleOnTeleportPlayerClicked}
              />
              <Dropdown.Menu.Item icon={<KickIcon />} label="Kick player" onClick={handleOnKickPlayerClicked} />
              <Dropdown.Menu.Item icon={<BanIcon />} label="Ban player" onClick={handleOnBanPlayerClicked} />
              <Dropdown.Menu.Item icon={<UnbanIcon />} label="Unban player" onClick={handleOnBanPlayerClicked} />
            </Dropdown.Menu.Group>
          </Dropdown.Menu>
        </Dropdown>
      </header>
      <PlayerInventoryTable pog={pog} />
      <GiveItemDialog
        gameServerId={gameServerId}
        playerId={playerId}
        open={openGiveItemDialog}
        setOpen={setOpenGiveItemDialog}
      />
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
    </Section>
  );
}
