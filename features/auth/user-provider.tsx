"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getProfileApi, refreshApi, type UserProfile } from "@/lib/api/auth";
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from "@/lib/auth/tokens";
import { useRouter } from "next/navigation";

/** Access token 만료(15분) 1분 전에 선제적으로 갱신 */
const PROACTIVE_REFRESH_INTERVAL = 14 * 60 * 1000; // 14분

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
  // 토큰이 없으면 프로필 요청 자체가 없으므로 처음부터 false
  const [isLoading, setIsLoading] = useState(() => !!getAccessToken());
  const router = useRouter();

  const fetchProfile = useCallback(() => {
    const token = getAccessToken();
    if (!token) return; // 동기 setIsLoading 제거 — 초기값으로 이미 처리됨
    getProfileApi(token)
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // 선제적 토큰 갱신 — 14분마다 refresh token으로 새 access token 발급
  useEffect(() => {
    const interval = setInterval(async () => {
      const refreshToken = getRefreshToken();
      if (!refreshToken) return;
      try {
        const tokens = await refreshApi(refreshToken);
        setTokens(tokens.accessToken, tokens.refreshToken);
      } catch {
        clearTokens();
        router.push("/login");
      }
    }, PROACTIVE_REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [router]);

  return (
    <UserContext.Provider value={{ user, isLoading, refreshUser: fetchProfile }}>
      {children}
    </UserContext.Provider>
  );
}
