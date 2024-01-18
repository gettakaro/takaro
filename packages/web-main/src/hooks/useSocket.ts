import { EnvVars } from 'EnvVars';
import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useConfig } from './useConfig';

let socket: Socket<never, any> | null = null;

export const useSocket = () => {
  const cfg = useConfig();

  useEffect(() => {
    if (!socket) return;

    return () => {
      if (!socket) return;
      socket.off('connect');
      socket.off('disconnect');
    };
  }, []);

  if (socket) {
    return { socket, isConnected: socket.connected };
  }

  const apiUrl = cfg?.apiUrl;

  if (!apiUrl) throw new Error(`${EnvVars.VITE_API} is not set`);

  socket = io(apiUrl, {
    withCredentials: true,
  });

  socket.emit('ping');
  return { socket, isConnected: socket.connected };
};
