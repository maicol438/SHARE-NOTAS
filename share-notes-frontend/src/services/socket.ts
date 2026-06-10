import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';

let socket: Socket | null = null;

export const connectSocket = (): void => {
  const cookieString: string = document.cookie;
  const token: string | undefined = cookieString
    .split('; ')
    .find((row: string) => row.startsWith('token='))
    ?.split('=')[1];

  if (!token || socket?.connected) return;

  const backendUrl: string = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

  socket = io(backendUrl, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {});

  socket.on('comment:new', (data: { by: string; noteTitle: string }) => {
    toast.success(`${data.by} comentó en "${data.noteTitle}"`, {
      duration: 4000,
    });
  });

  socket.on('note:shared', (data: { sharedBy: string; noteTitle: string }) => {
    toast.success(`${data.sharedBy} compartió "${data.noteTitle}" contigo`, {
      duration: 4000,
    });
  });

  socket.on('disconnect', () => {});

  socket.on('connect_error', (err: Error) => {
    if (err.message === 'Authentication required' || err.message === 'Invalid token') {
      socket?.disconnect();
      socket = null;
    }
  });
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = (): Socket | null => socket;
