import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

let socket: Socket<never, never> | null = null;

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!socket) return;

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    return () => {
      if (!socket) return;
      socket.off('connect');
      socket.off('disconnect');
    };
  }, []);

  if (socket) {
    return { socket, isConnected };
  }

  if (!process.env.REACT_APP_API) throw new Error('REACT_APP_API is not set');

  socket = io(process.env.REACT_APP_API, {
    withCredentials: true,
  });

  return { socket, isConnected };
};
