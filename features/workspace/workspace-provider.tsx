"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getWorkspacesApi } from "@/lib/api/workspace";
import { getAccessToken } from "@/lib/auth/tokens";

type Workspace = {
  id: string;
  name: string;
  description: string | null;
  iconUrl: string | null;
};

type WorkspaceContextValue = {
  currentWorkspace: Workspace | null;
  workspaces: Workspace[];
  isLoading: boolean;
  switchWorkspace: (workspace: Workspace) => void;
  addWorkspace: (workspace: Workspace) => void;
};

const WorkspaceContext = createContext<WorkspaceContextValue>({
  currentWorkspace: null,
  workspaces: [],
  isLoading: true,
  switchWorkspace: () => {},
  addWorkspace: () => {},
});

export function useWorkspace() {
  return useContext(WorkspaceContext);
}

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  // 토큰이 없으면 로딩할 내용이 없으므로 false로 초기화
  const [isLoading, setIsLoading] = useState(() => !!getAccessToken());

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;
    getWorkspacesApi(token)
      .then((list) => {
        setWorkspaces(list);
        setCurrentWorkspace(list[0] ?? null);
      })
      .catch(() => {
        setWorkspaces([]);
        setCurrentWorkspace(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const switchWorkspace = useCallback((workspace: Workspace) => {
    setCurrentWorkspace(workspace);
  }, []);

  const addWorkspace = useCallback((workspace: Workspace) => {
    setWorkspaces((prev) => [...prev, workspace]);
    setCurrentWorkspace(workspace);
  }, []);

  return (
    <WorkspaceContext.Provider value={{ currentWorkspace, workspaces, isLoading, switchWorkspace, addWorkspace }}>
      {children}
    </WorkspaceContext.Provider>
  );
}
