import { FC } from 'react';
import { Tooltip, styled, Skeleton } from '@takaro/lib-components';
import { useGameServers } from 'queries/gameservers';
import { GameServerOutputDTO, GameServerOutputDTOTypeEnum, PlayerOnGameserverOutputDTO } from '@takaro/apiclient';

interface IPlayerInventoryProps {
  pogs: PlayerOnGameserverOutputDTO[];
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

const ItemName = styled.p`
  overflow-x: scroll;
`;

export const PlayerInventoryTable: FC<IPlayerInventoryProps> = ({ pogs }) => {
  const { data: gameservers, isLoading } = useGameServers({
    filters: {
      id: pogs.map((player) => player.gameServerId),
    },
  });

  if (isLoading) return <Skeleton variant="rectangular" width="100%" height="100%" />;

  if (!pogs.length) return <p>No inventory data</p>;

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

  if (!pogs.length) return null;
  const placeholderIcon = '/favicon.ico';

  const components = pogs.map((player) => {
    if (!player.inventory.length) return null;
    const server = gameservers?.pages[0].data.find((server) => server.id === player.gameServerId);

    const serverType = getServerType(server);

    return (
      <Grid>
        {player.inventory.map((item, index) => (
          <Tooltip placement={'top'}>
            <Tooltip.Trigger asChild>
              <GridItem key={index}>
                <ItemIcon
                  src={serverType ? `/icons/${serverType}/${item.code}.png` : placeholderIcon}
                  alt={item.name}
                  onError={(e) => (e.currentTarget.src = placeholderIcon)}
                />
                <ItemName>
                  {item.amount} x {item.name}
                </ItemName>
              </GridItem>
            </Tooltip.Trigger>
            {item.description?.length && <Tooltip.Content>{item.description}</Tooltip.Content>}
          </Tooltip>
        ))}
      </Grid>
    );
  });

  return <>{components}</>;
};