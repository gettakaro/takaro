import { FC, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { Button } from "@takaro/lib-components";

if (!process.env.REACT_APP_API) throw new Error('REACT_APP_API is not set');

const socket = io(process.env.REACT_APP_API, {
  withCredentials: true,
});


const Dashboard: FC = () => {

  const [isConnected, setIsConnected] = useState(socket.connected);
  const [lastPong, setLastPong] = useState<string|null>(null);
  const [lastEvent, setLastEvent] = useState<string|null>(null);

  useEffect(() => {
    socket.on('connect', () => {
      console.log('connected')
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('disconnected')

      setIsConnected(false);
    });

    socket.on('pong', () => {
      setLastPong(new Date().toISOString());
    });

    socket.on('gameEvent', (type, data) => {
      setLastEvent(`${type} - ${JSON.stringify(data)}`);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('pong');
    };
  }, []);

  const sendPing = () => {
    socket.emit('ping');
  }

  return (
    <div>
      <p>Connected: { '' + isConnected }</p>
      <p>Last pong: { lastPong || '-' }</p>
      <p>Last event: { lastEvent || '-' }</p>
      <Button text={'Send ping'} onClick={ sendPing }/>
    </div>
  );
}

export default Dashboard;