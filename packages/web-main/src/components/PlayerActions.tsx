import { Dropdown, useTheme } from '@takaro/lib-components';
import { useNavigate } from '@tanstack/react-router';
import { FC, PropsWithChildren, useState } from 'react';

import {
  AiOutlineUserDelete as KickIcon,
  AiOutlineUsergroupDelete as BanIcon,
  AiOutlineGift as GiveItemIcon,
  AiOutlineCompass as TeleportIcon,
  AiOutlineLink as LinkIcon,
  AiOutlineDollar as CurrencyIcon,
} from 'react-icons/ai';
import { PlayerGiveItemDialog } from './dialogs/PlayerGiveItemDialog';
import { PlayerKickDialog } from './dialogs/PlayerKickDialog';
import { PlayerTeleportDialog } from './dialogs/PlayerTeleportDialog';
import { PlayerCurrencyDialog } from './dialogs/PlayerCurrencyDialog';
import { PlayerBanDialog } from './dialogs/PlayerBanDialog';

interface PlayerActionsProps {
  playerId: string;
  gameServerId: string;
}

export const PlayerActions: FC<PropsWithChildren<PlayerActionsProps>> = ({ children, playerId, gameServerId }) => {
  const theme = useTheme();
  const [showPlayerGiveItemDialog, setShowPlayerGiveItemDialog] = useState<boolean>(false);
  const [showPlayerKickDialog, setShowPlayerKickDialog] = useState<boolean>(false);
  const [showPlayerBanDialog, setShowPlayerBanDialog] = useState<boolean>(false);
  const [showPlayerTeleportDialog, setShowPlayerTeleportDialog] = useState<boolean>(false);
  const [showPlayerCurrencyDialog, setShowPlayerCurrencyDialog] = useState<boolean>(false);
  const navigate = useNavigate();

  return (
    <>
      <PlayerGiveItemDialog
        playerId={playerId}
        gameServerId={gameServerId}
        open={showPlayerGiveItemDialog}
        onOpenChange={setShowPlayerGiveItemDialog}
      />
      <PlayerKickDialog
        playerId={playerId}
        gameServerId={gameServerId}
        onOpenChange={setShowPlayerKickDialog}
        open={showPlayerKickDialog}
      />
      <PlayerTeleportDialog
        playerId={playerId}
        gameServerId={gameServerId}
        onOpenChange={setShowPlayerTeleportDialog}
        open={showPlayerTeleportDialog}
      />
      <PlayerCurrencyDialog
        playerId={playerId}
        gameServerId={gameServerId}
        onOpenChange={setShowPlayerCurrencyDialog}
        open={showPlayerCurrencyDialog}
      />

      <PlayerBanDialog playerId={playerId} onOpenChange={setShowPlayerBanDialog} open={showPlayerBanDialog} />
      <Dropdown>
        <Dropdown.Trigger asChild>{children}</Dropdown.Trigger>
        <Dropdown.Menu>
          <Dropdown.Menu.Group label="Actions">
            <Dropdown.Menu.Item
              icon={<GiveItemIcon />}
              onClick={() => setShowPlayerGiveItemDialog(true)}
              label="Give Item"
            />
            <Dropdown.Menu.Item
              icon={<TeleportIcon />}
              onClick={() => setShowPlayerTeleportDialog(true)}
              label="Teleport player"
            />
            <Dropdown.Menu.Item
              icon={<CurrencyIcon />}
              onClick={() => setShowPlayerCurrencyDialog(true)}
              label="Add/Deduct Currency"
            />
            <Dropdown.Menu.Item
              icon={<KickIcon fill={theme.colors.warning} />}
              onClick={() => setShowPlayerKickDialog(true)}
              label="Kick player"
            />
            <Dropdown.Menu.Item
              icon={<BanIcon fill={theme.colors.error} />}
              onClick={() => setShowPlayerBanDialog(true)}
              label="Ban player"
            />
          </Dropdown.Menu.Group>
          <Dropdown.Menu.Item
            icon={<LinkIcon />}
            onClick={() => navigate({ to: '/player/$playerId/info', params: { playerId } })}
            label="View Profile"
          />
        </Dropdown.Menu>
      </Dropdown>
    </>
  );
};
