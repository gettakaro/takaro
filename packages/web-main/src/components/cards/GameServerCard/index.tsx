import { FC, useEffect } from 'react';
import { Chip, Tooltip, Card, Skeleton } from '@takaro/lib-components';
import { EventOutputDTO, GameServerOutputDTO } from '@takaro/apiclient';
import { useNavigate } from '@tanstack/react-router';

import { Header, TitleContainer, DetailsContainer } from './style';
import { InnerBody } from '../style';
import { useSocket } from '../../../hooks/useSocket';
import { playersOnGameServersQueryOptions } from '../../../queries/pog';
import { useQuery } from '@tanstack/react-query';
import { GameServerActions } from '../../../routes/_auth/_global/gameservers';

const StatusChip: FC<{ reachable: boolean; enabled: boolean }> = ({ reachable, enabled }) => {
  if (!enabled) return <Chip label="disabled" color="warning" variant="outline" />;
  if (!reachable) return <Chip label="offline" color="error" variant="outline" />;
  return 'online';
};

export const GameServerCard: FC<GameServerOutputDTO> = ({ id, name, type, reachable, enabled }) => {
  const navigate = useNavigate();
  const { socket } = useSocket();
  const {
    data: onlinePogs,
    isLoading: isLoadingPogs,
    refetch,
  } = useQuery(
    playersOnGameServersQueryOptions({
      filters: {
        online: [true],
        gameServerId: [id],
      },
    }),
  );

  useEffect(() => {
    socket.on('event', (event: EventOutputDTO) => {
      if (event.eventName === 'player-connected') refetch();
      if (event.eventName === 'player-disconnected') refetch();
    });

    return () => {
      socket.off('event');
    };
  }, []);

  return (
    <>
      <Card
        role="link"
        onClick={() => {
          navigate({
            to: '/gameserver/$gameServerId/dashboard/overview',
            params: { gameServerId: id },
          });
        }}
        data-testid={`gameserver-${id}-card`}
      >
        <Card.Body>
          <InnerBody>
            <Header>
              <StatusChip reachable={reachable} enabled={enabled} />
              <GameServerActions gameServerName={name} gameServerId={id} />
            </Header>
            <DetailsContainer>
              <TitleContainer>
                <h3>{name}</h3>
                <div>
                  <Tooltip placement="bottom">
                    <Tooltip.Trigger asChild>
                      <p>{type}</p>
                    </Tooltip.Trigger>
                    <Tooltip.Content>Game server type</Tooltip.Content>
                  </Tooltip>
                </div>
              </TitleContainer>
              <div>
                {isLoadingPogs && <Skeleton variant="rectangular" width="100px" height="15px" />}
                {!isLoadingPogs && !onlinePogs && <p>Online players: unknown</p>}
                {onlinePogs && <p>Online players: {onlinePogs?.data.length}</p>}
              </div>
            </DetailsContainer>
          </InnerBody>
        </Card.Body>
      </Card>
    </>
  );
};
