import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

let socket: Socket<never, never> | null = null;

declare global {
  interface Window {
    __env__: Record<string, string>;
  }
}

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

  const apiUrl = window.__env__.REACT_APP_API || process.env.REACT_APP_API;

  if (!apiUrl) throw new Error('REACT_APP_API is not set');

  socket = io(apiUrl, {
    withCredentials: true,
  });

  return { socket, isConnected };
};
