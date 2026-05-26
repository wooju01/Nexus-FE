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
};

const WorkspaceContext = createContext<WorkspaceContextValue>({
  currentWorkspace: null,
  workspaces: [],
  isLoading: true,
  switchWorkspace: () => {},
});

export function useWorkspace() {
  return useContext(WorkspaceContext);
}

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setIsLoading(false);
      return;
    }
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

  return (
    <WorkspaceContext.Provider value={{ currentWorkspace, workspaces, isLoading, switchWorkspace }}>
      {children}
    </WorkspaceContext.Provider>
  );
}
