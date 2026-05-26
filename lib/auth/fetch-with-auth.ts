/**
 * fetchWithAuth
 *
 * Authorization 헤더를 자동으로 붙이고,
 * 401 응답 시 refresh token으로 access token을 갱신한 뒤 요청을 한 번 재시도한다.
 * 갱신에도 실패하면 토큰을 삭제하고 /login으로 리다이렉트한다.
 */

import { getAccessToken, getRefreshToken, setTokens, clearTokens } from "./tokens";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

/** 동시에 여러 요청이 401을 받았을 때 refresh를 한 번만 호출하기 위한 Promise 공유 */
let refreshingPromise: Promise<string> | null = null;

async function doRefresh(): Promise<string> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error("No refresh token");

  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) throw new Error("Refresh failed");

  const tokens: { accessToken: string; refreshToken: string } = await res.json();
  setTokens(tokens.accessToken, tokens.refreshToken);
  return tokens.accessToken;
}

type FetchWithAuthOptions = RequestInit & {
  /** Content-Type을 자동으로 붙이지 않으려면 false */
  json?: boolean;
};

export async function fetchWithAuth(
  url: string,
  options: FetchWithAuthOptions = {},
): Promise<Response> {
  const { json = false, ...init } = options;

  function buildHeaders(token: string): HeadersInit {
    return {
      ...(json ? { "Content-Type": "application/json" } : {}),
      Authorization: `Bearer ${token}`,
      ...(init.headers ?? {}),
    };
  }

  const accessToken = getAccessToken();
  if (!accessToken) {
    redirectToLogin();
    throw new Error("No access token");
  }

  // 1차 요청
  let res = await fetch(url, { ...init, headers: buildHeaders(accessToken) });

  // 401이 아니면 바로 반환
  if (res.status !== 401) return res;

  // 401 → refresh 시도 (동시 요청 중복 방지)
  try {
    if (!refreshingPromise) {
      refreshingPromise = doRefresh().finally(() => {
        refreshingPromise = null;
      });
    }
    const newToken = await refreshingPromise;

    // 새 토큰으로 재시도
    res = await fetch(url, { ...init, headers: buildHeaders(newToken) });
    return res;
  } catch {
    clearTokens();
    redirectToLogin();
    throw new Error("Session expired");
  }
}

function redirectToLogin() {
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}
