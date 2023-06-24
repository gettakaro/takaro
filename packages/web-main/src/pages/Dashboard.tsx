import { FC, useEffect, useState } from 'react';
import { Button, styled } from '@takaro/lib-components';
import { useSocket } from 'hooks/useSocket';
import { Helmet } from 'react-helmet';

export const Container = styled.div`
  h1 {
    font-size: ${({ theme }) => theme.fontSize.huge};
    margin-bottom: ${({ theme }) => theme.spacing[5]};
  }
`;

const Flex = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[4]};
`;

const Dashboard: FC = () => {
  const { socket, isConnected } = useSocket();

  const [lastPong, setLastPong] = useState<string | null>(null);
  const [lastEvent, setLastEvent] = useState<string | null>(null);

  const sendPing = () => {
    socket.emit('ping');
  };

  useEffect(() => {
    socket.emit('ping');
  }, [socket, isConnected]);

  useEffect(() => {
    socket.on('pong', () => {
      setLastPong(new Date().toISOString());
    });

    socket.on('gameEvent', (gameserverId, type, data) => {
      setLastEvent(`${gameserverId} - ${type} - ${JSON.stringify(data)}`);
    });

    return () => {
      socket.off('pong');
    };
  });

  return (
    <>
      <Helmet>
        <title>Takaro - Dashboard</title>
      </Helmet>
      <Container>
        <Flex>
          <span>
            <p>Connected: {'' + isConnected}</p>
            <p>Last pong: {lastPong || '-'}</p>
            <p>Last event: {lastEvent || '-'}</p>
          </span>
          <Button text={'Send ping'} onClick={sendPing} />
        </Flex>
      </Container>
    </>
  );
};

export default Dashboard;
