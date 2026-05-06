const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

// NestJS가 실패 시 반환하는 형태
type ApiError = {
  message: string;
  statusCode: number;
};

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.ok) return res.json() as Promise<T>;
  const err: ApiError = await res.json();
  throw new Error(err.message ?? "알 수 없는 오류가 발생했습니다.");
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
export async function signupApi(name: string, email: string, password: string): Promise<AuthTokens> {
  const res = await fetch(`${API_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
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
  data: { name?: string },
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
