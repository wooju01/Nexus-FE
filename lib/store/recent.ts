/**
 * 최근 방문 스토어 (localStorage 기반, 워크스페이스별 저장)
 *
 * 저장 키: nx_recent_<workspaceId>
 * 저장 형태: RecentItem[] (최대 MAX_RECENT개, 최신순)
 */

const MAX_RECENT = 7;

export type RecentItemType = "channel" | "dm" | "project";

export type RecentItem = {
  id: string;
  type: RecentItemType;
  name: string;
  href: string;
  visitedAt: number; // Date.now()
};

function storageKey(workspaceId: string) {
  return `nx_recent_${workspaceId}`;
}

export function getRecent(workspaceId: string): RecentItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(storageKey(workspaceId));
    return raw ? (JSON.parse(raw) as RecentItem[]) : [];
  } catch {
    return [];
  }
}

/** 방문 기록 추가. 같은 항목이 있으면 맨 앞으로 이동. */
export function recordVisit(workspaceId: string, item: Omit<RecentItem, "visitedAt">): RecentItem[] {
  const current = getRecent(workspaceId).filter((i) => i.id !== item.id);
  const updated = [{ ...item, visitedAt: Date.now() }, ...current].slice(0, MAX_RECENT);
  localStorage.setItem(storageKey(workspaceId), JSON.stringify(updated));
  return updated;
}
