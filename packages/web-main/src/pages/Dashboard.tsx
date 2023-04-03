import { FC, useEffect, useState } from 'react';
import { Button, styled } from '@takaro/lib-components';
import { useSocket } from 'hooks/useSocket';
import { useUser } from 'hooks/useUser';

export const Container = styled.div`
  h1 {
    font-size: ${({ theme }) => theme.fontSize.huge};
    margin-bottom: ${({ theme }) => theme.spacing[5]};
  }
`;

const Dashboard: FC = () => {
  const { socket, isConnected } = useSocket();
  const { userData } = useUser();

  const [lastPong, setLastPong] = useState<string | null>(null);
  const [lastEvent, setLastEvent] = useState<string | null>(null);

  const sendPing = () => {
    socket.emit('ping');
  };

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
    <Container>
      <h1>Hello, {userData.name}</h1>

      <p>Connected: {'' + isConnected}</p>
      <p>Last pong: {lastPong || '-'}</p>
      <p>Last event: {lastEvent || '-'}</p>
      <Button text={'Send ping'} onClick={sendPing} />
    </Container>
  );
};

export default Dashboard;
