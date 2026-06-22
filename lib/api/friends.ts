import { fetchWithAuth } from "@/lib/auth/fetch-with-auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type ApiError = { message: string; statusCode: number };

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.ok) {
    if (res.status === 204) return undefined as T;
    return res.json() as Promise<T>;
  }
  const err: ApiError = await res.json();
  throw new Error(err.message ?? "알 수 없는 오류가 발생했습니다.");
}

export type FriendUser = {
  id: string;
  name: string;
  username: string | null;
  avatar: string | null;
  status: "ONLINE" | "AWAY" | "DND" | "OFFLINE";
};

export type Friend = {
  friendRequestId: string;
  user: FriendUser;
};

export type FriendRequest = {
  id: string;
  status: string;
  createdAt: string;
  sender?: FriendUser;
  receiver?: FriendUser;
};

export async function sendFriendRequestApi(
  _token: string,
  username: string,
): Promise<FriendRequest> {
  const res = await fetchWithAuth(`${API_URL}/friends/requests`, {
    method: "POST",
    json: true,
    body: JSON.stringify({ username }),
  });
  return handleResponse<FriendRequest>(res);
}

export async function getReceivedRequestsApi(_token: string): Promise<FriendRequest[]> {
  const res = await fetchWithAuth(`${API_URL}/friends/requests/received`);
  return handleResponse<FriendRequest[]>(res);
}

export async function getSentRequestsApi(_token: string): Promise<FriendRequest[]> {
  const res = await fetchWithAuth(`${API_URL}/friends/requests/sent`);
  return handleResponse<FriendRequest[]>(res);
}

export async function acceptFriendRequestApi(_token: string, requestId: string): Promise<FriendRequest> {
  const res = await fetchWithAuth(`${API_URL}/friends/requests/${requestId}/accept`, {
    method: "PATCH",
  });
  return handleResponse<FriendRequest>(res);
}

export async function declineFriendRequestApi(_token: string, requestId: string): Promise<void> {
  const res = await fetchWithAuth(`${API_URL}/friends/requests/${requestId}/decline`, {
    method: "PATCH",
  });
  return handleResponse<void>(res);
}

export async function cancelFriendRequestApi(_token: string, requestId: string): Promise<void> {
  const res = await fetchWithAuth(`${API_URL}/friends/requests/${requestId}`, {
    method: "DELETE",
  });
  return handleResponse<void>(res);
}

export async function getFriendsApi(_token: string): Promise<Friend[]> {
  const res = await fetchWithAuth(`${API_URL}/friends`);
  return handleResponse<Friend[]>(res);
}

export async function removeFriendApi(_token: string, friendUserId: string): Promise<void> {
  const res = await fetchWithAuth(`${API_URL}/friends/${friendUserId}`, {
    method: "DELETE",
  });
  return handleResponse<void>(res);
}
