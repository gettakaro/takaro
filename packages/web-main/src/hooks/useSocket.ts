import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useConfig } from './useConfig';

let socket: Socket<never, never> | null = null;

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const cfg = useConfig();

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

  const apiUrl = cfg?.apiUrl;

  if (!apiUrl) throw new Error('REACT_APP_API is not set');

  socket = io(apiUrl, {
    withCredentials: true,
  });

  return { socket, isConnected };
};
