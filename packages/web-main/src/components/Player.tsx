import { Avatar, Chip, getInitials } from '@takaro/lib-components';
import { playerQueryOptions } from '../queries/player';
import { FC, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { PlayerGiveItemDialog } from './dialogs/PlayerGiveItemDialog';
import { PlayerKickDialog } from './dialogs/PlayerKickDialog';
import { PlayerBanDialog } from './dialogs/PlayerBanDialog';
import { Dropdown } from '@takaro/lib-components';
import { PlayerTeleportDialog } from './dialogs/PlayerTeleportDialog';
import {
  AiOutlineUserDelete as KickIcon,
  AiOutlineUsergroupDelete as BanIcon,
  AiOutlineGift as GiveItemIcon,
  AiOutlineCompass as TeleportIcon,
  AiOutlineLink as LinkIcon,
  AiOutlineDollar as CurrencyIcon,
} from 'react-icons/ai';
import { PlayerCurrencyDialog } from './dialogs/PlayerCurrencyDialog';

interface PlayerProps {
  playerId: string;
  name?: string;
  avatarUrl?: string;
  showAvatar?: boolean;
  isLoading?: boolean;
  hasError?: boolean;
  gameServerId?: string;
}

type PlayerContainerProps = Pick<PlayerProps, 'showAvatar' | 'playerId'>;

export const PlayerContainer: FC<PlayerContainerProps> = ({ playerId, showAvatar }) => {
  const { data: player, error } = useQuery(playerQueryOptions(playerId));

  return <Player playerId={playerId} name={player?.name} showAvatar={showAvatar} hasError={error !== null} />;
};

export const Player: FC<PlayerProps> = ({ playerId, name, avatarUrl, showAvatar, hasError, gameServerId }) => {
  const [showPlayerGiveItemDialog, setShowPlayerGiveItemDialog] = useState<boolean>(false);
  const [showPlayerKickDialog, setShowPlayerKickDialog] = useState<boolean>(false);
  const [showPlayerBanDialog, setShowPlayerBanDialog] = useState<boolean>(false);
  const [showPlayerTeleportDialog, setShowPlayerTeleportDialog] = useState<boolean>(false);
  const [showPlayerCurrencyDialog, setShowPlayerCurrencyDialog] = useState<boolean>(false);
  const navigate = useNavigate();

  if (!name || hasError) {
    return <Chip variant="outline" color="backgroundAccent" label="unknown" />;
  }

  const avatar = (
    <Avatar size="tiny">
      <Avatar.Image src={avatarUrl} alt={`steam-avatar-${name}`} />
      <Avatar.FallBack>{getInitials(name)}</Avatar.FallBack>
    </Avatar>
  );

  const canInteractWithPlayer = gameServerId;

  return (
    <div>
      {canInteractWithPlayer && (
        <PlayerGiveItemDialog
          playerId={playerId}
          gameServerId={gameServerId}
          open={showPlayerGiveItemDialog}
          onOpenChange={setShowPlayerGiveItemDialog}
        />
      )}
      {canInteractWithPlayer && (
        <PlayerKickDialog
          playerId={playerId}
          gameServerId={gameServerId}
          onOpenChange={setShowPlayerKickDialog}
          open={showPlayerKickDialog}
        />
      )}
      {canInteractWithPlayer && (
        <PlayerTeleportDialog
          playerId={playerId}
          gameServerId={gameServerId}
          onOpenChange={setShowPlayerTeleportDialog}
          open={showPlayerTeleportDialog}
        />
      )}
      {canInteractWithPlayer && (
        <PlayerCurrencyDialog
          playerId={playerId}
          gameServerId={gameServerId}
          onOpenChange={setShowPlayerCurrencyDialog}
          open={showPlayerCurrencyDialog}
        />
      )}
      <PlayerBanDialog playerId={playerId} onOpenChange={setShowPlayerBanDialog} open={showPlayerBanDialog} />
      <Dropdown>
        <Dropdown.Trigger asChild>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            {showAvatar && avatar}
            <span>{name}</span>
          </div>
        </Dropdown.Trigger>
        <Dropdown.Menu>
          {canInteractWithPlayer && (
            <Dropdown.Menu.Group label="Actions">
              <Dropdown.Menu.Item
                icon={<GiveItemIcon />}
                onClick={() => setShowPlayerGiveItemDialog(true)}
                label="Give Item"
                disabled={!canInteractWithPlayer}
              />
              <Dropdown.Menu.Item
                icon={<KickIcon />}
                onClick={() => setShowPlayerKickDialog(true)}
                label="Kick player"
                disabled={!canInteractWithPlayer}
              />
              <Dropdown.Menu.Item
                icon={<BanIcon />}
                onClick={() => setShowPlayerBanDialog(true)}
                label="Ban player"
                disabled={!canInteractWithPlayer}
              />
              <Dropdown.Menu.Item
                icon={<TeleportIcon />}
                onClick={() => setShowPlayerTeleportDialog(true)}
                label="Teleport player"
                disabled={!canInteractWithPlayer}
              />
              <Dropdown.Menu.Item
                icon={<CurrencyIcon />}
                onClick={() => setShowPlayerCurrencyDialog(true)}
                label="Add/Deduct Currency"
              />
            </Dropdown.Menu.Group>
          )}
          <Dropdown.Menu.Item
            icon={<LinkIcon />}
            onClick={() => navigate({ to: '/player/$playerId/info', params: { playerId } })}
            label="View Profile"
          />
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
};
