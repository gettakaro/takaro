import { io } from 'socket.io-client';
import { getConfigVar } from 'util/getConfigVar';

export const socket = io(getConfigVar('apiUrl'), {
  withCredentials: true,
});
