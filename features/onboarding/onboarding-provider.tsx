"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

/* ─── 타입 ─── */

type ProfileData = {
  displayName: string;
  role: string;
  avatarFile: File | null;
};

type WorkspaceData = {
  workspaceName: string;
  workspaceSlug: string;
};

type OnboardingState = {
  profile: ProfileData;
  workspace: WorkspaceData;
};

type OnboardingContextValue = {
  state: OnboardingState;
  updateProfile: (data: Partial<ProfileData>) => void;
  updateWorkspace: (data: Partial<WorkspaceData>) => void;
};

/* ─── 초기값 ─── */

const INITIAL_STATE: OnboardingState = {
  profile: {
    displayName: "",
    role: "",
    avatarFile: null,
  },
  workspace: {
    workspaceName: "",
    workspaceSlug: "",
  },
};

/* ─── Context ─── */

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function useOnboarding(): OnboardingContextValue {
  const ctx = useContext(OnboardingContext);
  if (!ctx) {
    throw new Error("useOnboarding은 OnboardingProvider 안에서 사용해야 합니다.");
  }
  return ctx;
}

/* ─── Provider ─── */

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<OnboardingState>(INITIAL_STATE);

  const updateProfile = useCallback((data: Partial<ProfileData>) => {
    setState((prev) => ({
      ...prev,
      profile: { ...prev.profile, ...data },
    }));
  }, []);

  const updateWorkspace = useCallback((data: Partial<WorkspaceData>) => {
    setState((prev) => ({
      ...prev,
      workspace: { ...prev.workspace, ...data },
    }));
  }, []);

  const value = useMemo(
    () => ({ state, updateProfile, updateWorkspace }),
    [state, updateProfile, updateWorkspace],
  );

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}
