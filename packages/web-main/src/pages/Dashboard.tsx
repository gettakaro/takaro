import { FC, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { Button } from '@takaro/lib-components';
import { useSocket } from 'hooks/useSocket';

const Dashboard: FC = () => {
  const { socket, isConnected } = useSocket();

  const [lastPong, setLastPong] = useState<string | null>(null);
  const [lastEvent, setLastEvent] = useState<string | null>(null);

  const sendPing = () => {
    socket.emit('ping');
  };

  return (
    <div>
      <p>Connected: {'' + isConnected}</p>
      <p>Last pong: {lastPong || '-'}</p>
      <p>Last event: {lastEvent || '-'}</p>
      <Button text={'Send ping'} onClick={sendPing} />
    </div>
  );
};

export default Dashboard;
