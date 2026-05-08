const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

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
  const res = await fetch(
    `${API_URL}/channels/${channelId}/messages?${params.toString()}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  return handleResponse<Message[]>(res);
}

// POST /channels/:channelId/messages
export async function sendMessageApi(
  accessToken: string,
  channelId: string,
  content: unknown,
): Promise<Message> {
  const res = await fetch(`${API_URL}/channels/${channelId}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ content }),
  });
  return handleResponse<Message>(res);
}

// PATCH /messages/:messageId
export async function updateMessageApi(
  accessToken: string,
  messageId: string,
  content: unknown,
): Promise<Message> {
  const res = await fetch(`${API_URL}/messages/${messageId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ content }),
  });
  return handleResponse<Message>(res);
}

// DELETE /messages/:messageId
export async function deleteMessageApi(
  accessToken: string,
  messageId: string,
): Promise<void> {
  await fetch(`${API_URL}/messages/${messageId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

// GET /messages/:messageId/replies
export async function getRepliesApi(
  accessToken: string,
  messageId: string,
): Promise<Message[]> {
  const res = await fetch(`${API_URL}/messages/${messageId}/replies`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return handleResponse<Message[]>(res);
}

// POST /messages/:messageId/replies
export async function addReplyApi(
  accessToken: string,
  messageId: string,
  content: unknown,
): Promise<Message> {
  const res = await fetch(`${API_URL}/messages/${messageId}/replies`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ content }),
  });
  return handleResponse<Message>(res);
}

// POST /messages/:messageId/reactions
export async function addReactionApi(
  accessToken: string,
  messageId: string,
  emoji: string,
): Promise<void> {
  await fetch(`${API_URL}/messages/${messageId}/reactions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ emoji }),
  });
}

// DELETE /messages/:messageId/reactions/:emoji
export async function removeReactionApi(
  accessToken: string,
  messageId: string,
  emoji: string,
): Promise<void> {
  await fetch(`${API_URL}/messages/${messageId}/reactions/${encodeURIComponent(emoji)}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

// POST /channels/:channelId/read-markers
export async function updateReadMarkerApi(
  accessToken: string,
  channelId: string,
  lastReadMessageId: string,
): Promise<void> {
  await fetch(`${API_URL}/channels/${channelId}/read-markers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ lastReadMessageId }),
  });
}
