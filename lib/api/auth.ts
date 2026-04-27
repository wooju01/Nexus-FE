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
