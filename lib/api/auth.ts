const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

// HttpExceptionFilter 의 실제 응답 형태: { error: { code, message } }
type ApiErrorBody = {
  error?: { code?: string; message?: string };
};

const STATUS_FALLBACKS: Record<number, string> = {
  400: "입력 정보를 확인해 주세요.",
  401: "이메일 또는 비밀번호가 올바르지 않습니다.",
  403: "접근 권한이 없습니다.",
  404: "요청한 정보를 찾을 수 없습니다.",
  409: "이미 사용 중인 이메일 또는 아이디입니다.",
  429: "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.",
};

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.ok) return res.json() as Promise<T>;
  const body = (await res.json().catch(() => ({}))) as ApiErrorBody;
  const serverMessage = body.error?.message;
  const fallback = STATUS_FALLBACKS[res.status] ?? "알 수 없는 오류가 발생했습니다.";
  throw new Error(serverMessage ?? fallback);
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
  jobTitle: string | null;
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
  data: { name?: string; jobTitle?: string; username?: string; avatar?: string },
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
