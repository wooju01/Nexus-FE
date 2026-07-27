import { getAccessToken } from "@/lib/auth/tokens";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type UploadResult = {
  url: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
};

export async function uploadFileApi(file: File): Promise<UploadResult> {
  const token = getAccessToken();
  if (!token) throw new Error("No access token");

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_URL}/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
    throw new Error(body.error?.message ?? "업로드에 실패했습니다.");
  }

  return res.json() as Promise<UploadResult>;
}
