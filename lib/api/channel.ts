const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
import { fetchWithAuth } from "@/lib/auth/fetch-with-auth";

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.ok) return res.json() as Promise<T>;
  const err = await res.json();
  throw new Error(err.message ?? "알 수 없는 오류가 발생했습니다.");
}

export type Channel = {
  id: string;
  workspaceId: string;
  type: "CHANNEL" | "DM" | "GROUP_DM";
  name: string | null;
  topic: string | null;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: { members: number };
};

// GET /workspaces/:workspaceId/channels
export async function getChannelsApi(
  accessToken: string,
  workspaceId: string,
): Promise<Channel[]> {
  const res = await fetchWithAuth(`${API_URL}/workspaces/${workspaceId}/channels`);
  return handleResponse<Channel[]>(res);
}

// GET /channels/:channelId
export async function getChannelApi(
  accessToken: string,
  channelId: string,
): Promise<Channel> {
  const res = await fetchWithAuth(`${API_URL}/channels/${channelId}`);
  return handleResponse<Channel>(res);
}

// POST /channels/:channelId/members/me
export async function joinChannelApi(
  accessToken: string,
  channelId: string,
): Promise<void> {
  await fetchWithAuth(`${API_URL}/channels/${channelId}/members/me`, { method: "POST" });
}
