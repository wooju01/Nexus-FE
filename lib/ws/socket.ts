import { io, type Socket } from "socket.io-client";

const WS_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

let socket: Socket | null = null;

export function getSocket(token: string): Socket {
  if (socket?.connected) return socket;

  if (socket) {
    socket.disconnect();
  }

  socket = io(WS_URL, {
    auth: { token },
    transports: ["websocket"],
    autoConnect: true,
  });

  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
