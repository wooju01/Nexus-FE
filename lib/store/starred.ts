/**
 * 즐겨찾기 스토어 (localStorage 기반, 워크스페이스별 저장)
 *
 * 저장 키: nx_starred_<workspaceId>
 * 저장 형태: StarredItem[]
 */

export type StarredItemType = "channel" | "dm" | "project";

export type StarredItem = {
  id: string;
  type: StarredItemType;
  name: string;
  href: string;
};

function storageKey(workspaceId: string) {
  return `nx_starred_${workspaceId}`;
}

export function getStarred(workspaceId: string): StarredItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(storageKey(workspaceId));
    return raw ? (JSON.parse(raw) as StarredItem[]) : [];
  } catch {
    return [];
  }
}

export function isStarred(workspaceId: string, id: string): boolean {
  return getStarred(workspaceId).some((item) => item.id === id);
}

export function addStarred(workspaceId: string, item: StarredItem): StarredItem[] {
  const current = getStarred(workspaceId);
  if (current.some((i) => i.id === item.id)) return current;
  const updated = [item, ...current];
  localStorage.setItem(storageKey(workspaceId), JSON.stringify(updated));
  return updated;
}

export function removeStarred(workspaceId: string, id: string): StarredItem[] {
  const updated = getStarred(workspaceId).filter((i) => i.id !== id);
  localStorage.setItem(storageKey(workspaceId), JSON.stringify(updated));
  return updated;
}

export function toggleStarred(workspaceId: string, item: StarredItem): StarredItem[] {
  return isStarred(workspaceId, item.id)
    ? removeStarred(workspaceId, item.id)
    : addStarred(workspaceId, item);
}
