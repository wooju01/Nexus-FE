"use client";

import { createContext, useCallback, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { getSocket } from "@/lib/ws/client";

type AppShellContextValue = {
  inboxUnreadCount: number;
  setInboxUnreadCount: (v: number) => void;
  isMembersPanelOpen: boolean;
  toggleMembersPanel: () => void;
  /** 모바일(< md) 사이드바 드로어 열림 여부. 데스크톱에서는 무시된다. */
  isSidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
};

const AppShellContext = createContext<AppShellContextValue>({
  inboxUnreadCount: 0,
  setInboxUnreadCount: () => {},
  isMembersPanelOpen: false,
  toggleMembersPanel: () => {},
  isSidebarOpen: false,
  setSidebarOpen: () => {},
});

export function AppShellProvider({ children }: { children: ReactNode }) {
  const [inboxUnreadCount, setInboxUnreadCount] = useState(0);
  const [isMembersPanelOpen, setIsMembersPanelOpen] = useState(false);
  const toggleMembersPanel = useCallback(() => setIsMembersPanelOpen((v) => !v), []);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

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
    <AppShellContext.Provider value={{ inboxUnreadCount, setInboxUnreadCount, isMembersPanelOpen, toggleMembersPanel, isSidebarOpen, setSidebarOpen }}>
      {children}
    </AppShellContext.Provider>
  );
}

export function useAppShell() {
  return useContext(AppShellContext);
}
