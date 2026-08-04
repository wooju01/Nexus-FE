import { fetchWithAuth } from "@/lib/auth/fetch-with-auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.ok) {
    if (res.status === 204) return undefined as unknown as T;
    return res.json() as Promise<T>;
  }
  const body = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
  throw new Error(body.error?.message ?? "알 수 없는 오류가 발생했습니다.");
}

export type FriendRequest = {
  id: string;
  status: "PENDING" | "ACCEPTED" | "DECLINED" | "BLOCKED";
  receiver?: { id: string; name: string; username: string };
  sender?: { id: string; name: string; username: string };
  createdAt: string;
};

export type Friend = {
  friendRequestId: string;
  user: { id: string; name: string; username: string; avatar: string | null; status: string };
};

/** POST /friends/requests */
export async function sendFriendRequest(username: string): Promise<FriendRequest> {
  const res = await fetchWithAuth(`${API_URL}/friends/requests`, {
    method: "POST",
    json: true,
    body: JSON.stringify({ username }),
  });
  return handleResponse<FriendRequest>(res);
}

/** DELETE /friends/requests/:id — 보낸 요청 취소 */
export async function cancelFriendRequest(requestId: string): Promise<void> {
  const res = await fetchWithAuth(`${API_URL}/friends/requests/${requestId}`, { method: "DELETE" });
  await handleResponse<void>(res);
}

/** GET /friends/requests/sent */
export async function getSentFriendRequests(): Promise<FriendRequest[]> {
  const res = await fetchWithAuth(`${API_URL}/friends/requests/sent`);
  return handleResponse<FriendRequest[]>(res);
}

/** GET /friends */
export async function getFriends(): Promise<Friend[]> {
  const res = await fetchWithAuth(`${API_URL}/friends`);
  return handleResponse<Friend[]>(res);
}
