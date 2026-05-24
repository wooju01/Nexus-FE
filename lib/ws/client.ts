import { io, type Socket } from "socket.io-client";
import { getAccessToken } from "@/lib/auth/tokens";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const token = getAccessToken();
    socket = io(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000", {
      auth: { token },
    });
  }
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
