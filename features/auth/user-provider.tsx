"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getProfileApi } from "@/lib/api/auth";
import { getAccessToken } from "@/lib/auth/tokens";

type UserProfile = {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  status: string;
};

type UserContextValue = {
  user: UserProfile | null;
  isLoading: boolean;
};

const UserContext = createContext<UserContextValue>({ user: null, isLoading: true });

export function useUser() {
  return useContext(UserContext);
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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

  return (
    <UserContext.Provider value={{ user, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}
