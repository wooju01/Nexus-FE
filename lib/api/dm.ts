import { fetchWithAuth } from "@/lib/auth/fetch-with-auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.ok) return res.json() as Promise<T>;
  const err = await res.json();
  throw new Error(err.message ?? "알 수 없는 오류가 발생했습니다.");
}

export type DmChannel = {
  id: string;
  type: "DM";
  members: {
    user: {
      id: string;
      name: string;
      avatar: string | null;
      status: "ONLINE" | "AWAY" | "DND" | "OFFLINE";
    };
  }[];
};

// GET /dms — 글로벌 DM 목록
export async function getDmsApi(_token: string): Promise<DmChannel[]> {
  const res = await fetchWithAuth(`${API_URL}/dms`);
  return handleResponse<DmChannel[]>(res);
}

// POST /dms — DM 시작 (글로벌)
export async function createDmApi(
  _token: string,
  targetUserId: string,
): Promise<{ id: string }> {
  const res = await fetchWithAuth(`${API_URL}/dms`, {
    method: "POST",
    json: true,
    body: JSON.stringify({ targetUserId }),
  });
  return handleResponse<{ id: string }>(res);
}
