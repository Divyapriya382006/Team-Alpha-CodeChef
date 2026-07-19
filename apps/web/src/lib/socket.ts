import { io, type Socket } from 'socket.io-client';

const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
console.debug('[socket] connecting to', socketUrl);

export const socket: Socket = io(socketUrl, {
  autoConnect: false,
  transports: ['websocket', 'polling'],
  path: '/socket.io',
});
