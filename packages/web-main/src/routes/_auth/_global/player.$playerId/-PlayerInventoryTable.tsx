import { FC } from 'react';
import { Tooltip, styled, Skeleton } from '@takaro/lib-components';
import { gameServerQueryOptions } from '../../../../queries/gameserver';
import { PlayerOnGameserverOutputDTO } from '@takaro/apiclient';
import { useQuery } from '@tanstack/react-query';
import { getItemIconSrc } from '../../../../utils/itemIconUtils';

interface IPlayerInventoryProps {
  pog: PlayerOnGameserverOutputDTO;
}

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: ${(props) => props.theme.spacing[1]};
  padding: ${(props) => props.theme.spacing[1]};
`;

const GridItem = styled.div`
  border: 1px solid ${(props) => props.theme.colors.backgroundAccent};
  padding: ${(props) => props.theme.spacing[1]};
  text-align: center;
  background-color: ${(props) => props.theme.colors.backgroundAlt};
  color: ${(props) => props.theme.colors.text};
`;

const ItemImage = styled.img`
  width: 50px;
  height: 50px;
  margin-bottom: ${(props) => props.theme.spacing[1]};
`;

export const PlayerInventoryTable: FC<IPlayerInventoryProps> = ({ pog }) => {
  const { data: gameServer, isLoading } = useQuery(gameServerQueryOptions(pog.gameServerId));
  if (isLoading) return <Skeleton variant="rectangular" width="100%" height="100%" />;

  if (pog.inventory.length === 0) return <p>No inventory data</p>;

  const placeholderIcon = '/favicon.ico';

  return (
    <Grid>
      {pog.inventory.map((item, index) => (
        <Tooltip key={'tooltip' + item.name} placement="top">
          <Tooltip.Trigger asChild>
            <GridItem key={index}>
              <ItemImage
                src={gameServer ? getItemIconSrc(undefined, gameServer.type, item.code) : placeholderIcon}
                alt={item.name}
                onError={(e) => (e.currentTarget.src = placeholderIcon)}
              />
              <p>{item.amount}</p>
            </GridItem>
          </Tooltip.Trigger>
          <Tooltip.Content>{item.name}</Tooltip.Content>
        </Tooltip>
      ))}
    </Grid>
  );
};
