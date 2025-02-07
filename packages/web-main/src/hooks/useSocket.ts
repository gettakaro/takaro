import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { getConfigVar } from '../util/getConfigVar';

let socket: Socket<never, any> | null = null;

export const useSocket = () => {
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

  socket = io(getConfigVar('apiUrl'), {
    withCredentials: true,
  });

  socket.emit('ping');
  return { socket, isConnected: socket.connected };
};
