"use client";

import { createContext, useContext, useEffect, useState } from "react";
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
  isLoading: boolean;
};

const WorkspaceContext = createContext<WorkspaceContextValue>({
  currentWorkspace: null,
  isLoading: true,
});

export function useWorkspace() {
  return useContext(WorkspaceContext);
}

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setIsLoading(false);
      return;
    }
    getWorkspacesApi(token)
      .then((workspaces) => setCurrentWorkspace(workspaces[0] ?? null))
      .catch(() => setCurrentWorkspace(null))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <WorkspaceContext.Provider value={{ currentWorkspace, isLoading }}>
      {children}
    </WorkspaceContext.Provider>
  );
}
