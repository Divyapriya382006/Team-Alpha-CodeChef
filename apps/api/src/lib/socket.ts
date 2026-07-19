import type { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { config } from '../config';

let io: SocketIOServer | null = null;

export function initSocket(server: HttpServer): SocketIOServer {
  if (io) return io;

  io = new SocketIOServer(server, {
    cors: {
      origin: config.corsOrigin,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('disconnect', (reason) => {
      console.log(`Socket disconnected: ${socket.id} (${reason})`);
    });
  });

  return io;
}

export function emitEventUpdate(payload: {
  eventId: string;
  action: 'created' | 'updated' | 'approved' | 'rejected' | 'registered' | 'unregistered';
  status?: string;
  clubId?: string;
}): void {
  if (!io) return;
  io.emit('event:updated', payload);
}
