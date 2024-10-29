import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { getConfigVar } from 'util/getConfigVar';

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(getConfigVar('apiUrl'), {
        withCredentials: true,
      });
      socketRef.current.emit('ping');
    }

    return () => {
      if (!socketRef.current) return;
      socketRef.current.off('connect');
      socketRef.current.off('disconnect');
    };
  }, []);

  return { socket: socketRef.current, isConnected: socketRef.current?.connected ?? false };
};
