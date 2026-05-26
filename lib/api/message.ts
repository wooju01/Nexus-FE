const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
import { fetchWithAuth } from "@/lib/auth/fetch-with-auth";

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.ok) return res.json() as Promise<T>;
  const err = await res.json();
  throw new Error(err.message ?? "알 수 없는 오류가 발생했습니다.");
}

export type MessageAuthor = {
  id: string;
  name: string;
  avatar: string | null;
};

export type Message = {
  id: string;
  channelId: string;
  authorId: string;
  content: unknown; // Tiptap JSON
  parentId: string | null;
  editedAt: string | null;
  deletedAt: string | null;
  createdAt: string;
  author: MessageAuthor;
  reactions: { emoji: string; userId: string }[];
  _count?: { replies: number };
};

// GET /channels/:channelId/messages
export async function getMessagesApi(
  accessToken: string,
  channelId: string,
  cursor?: string,
): Promise<Message[]> {
  const params = new URLSearchParams();
  if (cursor) params.set("cursor", cursor);
  const res = await fetchWithAuth(`${API_URL}/channels/${channelId}/messages?${params.toString()}`);
  return handleResponse<Message[]>(res);
}

// POST /channels/:channelId/messages
export async function sendMessageApi(
  accessToken: string,
  channelId: string,
  content: unknown,
): Promise<Message> {
  const res = await fetchWithAuth(`${API_URL}/channels/${channelId}/messages`, { method: "POST", json: true, body: JSON.stringify({ content }) });
  return handleResponse<Message>(res);
}

// PATCH /messages/:messageId
export async function updateMessageApi(
  accessToken: string,
  messageId: string,
  content: unknown,
): Promise<Message> {
  const res = await fetchWithAuth(`${API_URL}/messages/${messageId}`, { method: "PATCH", json: true, body: JSON.stringify({ content }) });
  return handleResponse<Message>(res);
}

// DELETE /messages/:messageId
export async function deleteMessageApi(
  accessToken: string,
  messageId: string,
): Promise<void> {
  await fetchWithAuth(`${API_URL}/messages/${messageId}`, { method: "DELETE" });
}

// GET /messages/:messageId/replies
export async function getRepliesApi(
  accessToken: string,
  messageId: string,
): Promise<Message[]> {
  const res = await fetchWithAuth(`${API_URL}/messages/${messageId}/replies`);
  return handleResponse<Message[]>(res);
}

// POST /messages/:messageId/replies
export async function addReplyApi(
  accessToken: string,
  messageId: string,
  content: unknown,
): Promise<Message> {
  const res = await fetchWithAuth(`${API_URL}/messages/${messageId}/replies`, { method: "POST", json: true, body: JSON.stringify({ content }) });
  return handleResponse<Message>(res);
}

// POST /messages/:messageId/reactions
export async function addReactionApi(
  accessToken: string,
  messageId: string,
  emoji: string,
): Promise<void> {
  await fetchWithAuth(`${API_URL}/messages/${messageId}/reactions`, { method: "POST", json: true, body: JSON.stringify({ emoji }) });
}

// DELETE /messages/:messageId/reactions/:emoji
export async function removeReactionApi(
  accessToken: string,
  messageId: string,
  emoji: string,
): Promise<void> {
  await fetchWithAuth(`${API_URL}/messages/${messageId}/reactions/${encodeURIComponent(emoji)}`, { method: "DELETE" });
}

// POST /channels/:channelId/read-markers — 채널 진입 시 현재 시점으로 읽음 처리
export async function markChannelReadApi(
  accessToken: string,
  channelId: string,
): Promise<void> {
  await fetchWithAuth(`${API_URL}/channels/${channelId}/read-markers`, { method: "POST", json: true, body: JSON.stringify({}) });
}

// POST /channels/:channelId/read-markers
export async function updateReadMarkerApi(
  accessToken: string,
  channelId: string,
  lastReadMessageId: string,
): Promise<void> {
  await fetchWithAuth(`${API_URL}/channels/${channelId}/read-markers`, { method: "POST", json: true, body: JSON.stringify({ lastReadMessageId }) });
}
