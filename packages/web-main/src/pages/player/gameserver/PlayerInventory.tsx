import { Skeleton } from '@takaro/lib-components';
import { PATHS } from 'paths';
import { FC } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { Section } from '../style';
import { PlayerInventoryTable } from './PlayerInventoryTable';
import { PlayerOnGameserverOutputDTO } from '@takaro/apiclient';

export const PlayerInventory: FC = () => {
  const { playerId } = useParams<{ playerId: string }>();
  const navigate = useNavigate();
  if (!playerId) {
    navigate(PATHS.players());
    return <Skeleton variant="rectangular" width="100%" height="100%" />;
  }

  const { pog } = useOutletContext<{ pog: PlayerOnGameserverOutputDTO }>();

  if (!pog) {
    return null;
  }

  return (
    <Section style={{ minHeight: '250px' }}>
      <PlayerInventoryTable pog={pog} />
    </Section>
  );
};
