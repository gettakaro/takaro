import { FC } from 'react';
import { Tooltip, styled, Skeleton } from '@takaro/lib-components';
import { useGameServers } from 'queries/gameservers';
import { GameServerOutputDTO, GameServerOutputDTOTypeEnum, PlayerOnGameserverOutputDTO } from '@takaro/apiclient';
import { useSelectedGameServer } from 'hooks/useSelectedGameServerContext';

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

const ItemIcon = styled.img`
  width: 50px;
  height: 50px;
  margin-bottom: ${(props) => props.theme.spacing[1]};
`;

const ItemName = styled.p``;

export const PlayerInventoryTable: FC<IPlayerInventoryProps> = ({ pog }) => {
  const { selectedGameServerId } = useSelectedGameServer();
  const { data: gameservers, isLoading } = useGameServers({
    filters: {
      id: [selectedGameServerId],
    },
  });

  if (isLoading) return <Skeleton variant="rectangular" width="100%" height="100%" />;

  if (pog.inventory.length === 0) return <p>No inventory data</p>;

  function getServerType(server: GameServerOutputDTO | undefined) {
    if (!server) return null;

    switch (server.type) {
      case GameServerOutputDTOTypeEnum.Rust:
        return 'rust';
      case GameServerOutputDTOTypeEnum.Sevendaystodie:
        return '7d2d';
      default:
        break;
    }
  }

  const placeholderIcon = '/favicon.ico';

  const server = gameservers?.pages[0]?.data[0];

  const serverType = getServerType(server);

  return (
    <Grid>
      {pog.inventory.map((item, index) => (
        <Tooltip placement={'top'}>
          <Tooltip.Trigger asChild>
            <GridItem key={index}>
              <ItemIcon
                src={serverType ? `/icons/${serverType}/${item.code}.png` : placeholderIcon}
                alt={item.name}
                onError={(e) => (e.currentTarget.src = placeholderIcon)}
              />
              <ItemName>{item.amount}</ItemName>
            </GridItem>
          </Tooltip.Trigger>
          <Tooltip.Content>{item.name}</Tooltip.Content>
        </Tooltip>
      ))}
    </Grid>
  );
};
