"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getProfileApi, type UserProfile } from "@/lib/api/auth";
import { getAccessToken } from "@/lib/auth/tokens";

type UserContextValue = {
  user: UserProfile | null;
  isLoading: boolean;
  refreshUser: () => void;
};

const UserContext = createContext<UserContextValue>({
  user: null,
  isLoading: true,
  refreshUser: () => {},
});

export function useUser() {
  return useContext(UserContext);
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(() => {
    const token = getAccessToken();
    if (!token) {
      setIsLoading(false);
      return;
    }
    getProfileApi(token)
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return (
    <UserContext.Provider value={{ user, isLoading, refreshUser: fetchProfile }}>
      {children}
    </UserContext.Provider>
  );
}
