const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

type ApiError = {
  message: string | string[];
  statusCode: number;
};

const STATUS_FALLBACKS: Partial<Record<number, string>> = {
  409: "이미 사용 중인 이메일 또는 아이디입니다.",
  401: "인증이 필요합니다.",
  403: "접근 권한이 없습니다.",
};

const GENERIC_BE_MESSAGES = new Set(["Conflict", "Unauthorized", "Forbidden", "Not Found", "Bad Request"]);

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.ok) return res.json() as Promise<T>;
  try {
    const err: ApiError = await res.json();
    const raw = Array.isArray(err.message) ? err.message[0] : err.message;
    const msg = !raw || GENERIC_BE_MESSAGES.has(raw)
      ? (STATUS_FALLBACKS[res.status] ?? raw ?? "알 수 없는 오류가 발생했습니다.")
      : raw;
    throw new Error(msg);
  } catch (e) {
    if (e instanceof Error) throw e;
    throw new Error(STATUS_FALLBACKS[res.status] ?? "알 수 없는 오류가 발생했습니다.");
  }
}

/** POST /auth/login */
export async function loginApi(email: string, password: string): Promise<AuthTokens> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse<AuthTokens>(res);
}

//** POST /auth/signup */
export async function signupApi(name: string, username: string, email: string, password: string): Promise<AuthTokens> {
  const res = await fetch(`${API_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, username, email, password }),
  });
  return handleResponse<AuthTokens>(res);
}

/** POST /auth/refresh */
export async function refreshApi(refreshToken: string): Promise<AuthTokens> {
  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  return handleResponse<AuthTokens>(res);
}

export type UserProfile = {
  id: string;
  email: string;
  name: string;
  username: string | null;
  avatar: string | null;
  status: "ONLINE" | "AWAY" | "DND" | "OFFLINE";
  createdAt: string;
};

/** GET /auth/profile */
export async function getProfileApi(accessToken: string): Promise<UserProfile> {
  const res = await fetch(`${API_URL}/auth/profile`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return handleResponse<UserProfile>(res);
}

/** PATCH /auth/profile */
export async function updateProfileApi(
  accessToken: string,
  data: { name?: string; username?: string; avatar?: string },
): Promise<UserProfile> {
  const res = await fetch(`${API_URL}/auth/profile`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return handleResponse<UserProfile>(res);
}

/** PATCH /auth/profile/presence */
export async function updatePresenceApi(
  accessToken: string,
  status: "ONLINE" | "AWAY" | "DND" | "OFFLINE",
): Promise<{ id: string; status: string }> {
  const res = await fetch(`${API_URL}/auth/profile/presence`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });
  return handleResponse<{ id: string; status: string }>(res);
}

/** PATCH /auth/password */
export async function changePasswordApi(
  accessToken: string,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  const res = await fetch(`${API_URL}/auth/password`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message ?? "알 수 없는 오류가 발생했습니다.");
  }
}
