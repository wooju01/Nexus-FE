"use client";

import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { getSocket } from "@/lib/ws/client";

type AppShellContextValue = {
  inboxUnreadCount: number;
  setInboxUnreadCount: (v: number) => void;
};

const AppShellContext = createContext<AppShellContextValue>({
  inboxUnreadCount: 0,
  setInboxUnreadCount: () => {},
});

export function AppShellProvider({ children }: { children: ReactNode }) {
  const [inboxUnreadCount, setInboxUnreadCount] = useState(0);

  useEffect(() => {
    const socket = getSocket();
    function handleNew() {
      setInboxUnreadCount((prev) => prev + 1);
    }
    socket.on("notification.created", handleNew);
    return () => {
      socket.off("notification.created", handleNew);
    };
  }, []);

  return (
    <AppShellContext.Provider value={{ inboxUnreadCount, setInboxUnreadCount }}>
      {children}
    </AppShellContext.Provider>
  );
}

export function useAppShell() {
  return useContext(AppShellContext);
}
