"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { BoardIcon, StarIcon } from "@/components/icons";
import { CreateProjectModal } from "@/features/project/create-project-modal";
import { deleteProjectApi, type Project } from "@/lib/api/project";
import { getAccessToken } from "@/lib/auth/tokens";
import { isStarred, toggleStarred, type StarredItem } from "@/lib/store/starred";
import { removeFromRecent } from "@/lib/store/recent";
import type { RecentItem } from "@/lib/store/recent";
import { cn } from "@/lib/utils/cn";
import { SidebarSection } from "./sidebar-nav";

type Props = {
  wsId: string;
  pathname: string;
  projects: Project[];
  onProjectsChange: (projects: Project[]) => void;
  onChannelsChange: () => void;
  onRecentChange: (recent: RecentItem[]) => void;
};

export function SidebarProjectList({ wsId, pathname, projects, onProjectsChange, onChannelsChange, onRecentChange }: Props) {
  const router = useRouter();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  function handleToggleStar(item: StarredItem) {
    toggleStarred(wsId, item);
  }

  async function handleDelete() {
    if (!confirmDeleteId) return;
    setIsDeleting(true);
    try {
      const token = getAccessToken();
      if (token) await deleteProjectApi(confirmDeleteId);
      const deletedProject = projects.find((p) => p.id === confirmDeleteId);
      onProjectsChange(projects.filter((p) => p.id !== confirmDeleteId));
      // 프로젝트 + 연동 채널 모두 recent에서 제거
      let updated = removeFromRecent(wsId, confirmDeleteId);
      if (deletedProject?.linkedChannelId) {
        updated = removeFromRecent(wsId, deletedProject.linkedChannelId);
      }
      onRecentChange(updated);
      onChannelsChange();
      if (pathname.startsWith(`/projects/${confirmDeleteId}`)) {
        router.push("/dashboard");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
      setConfirmDeleteId(null);
    }
  }

  return (
    <>
      <SidebarSection
        title="Projects"
        actionLabel="프로젝트 추가"
        onAction={() => setIsCreateModalOpen(true)}
      >
        <ul className="space-y-0.5">
          {projects.map((p) => {
            const href = `/projects/${p.id}`;
            const isActive = pathname.startsWith(href);
            const starItem: StarredItem = { id: p.id, type: "project", name: p.name, href };
            const starred = isStarred(wsId, p.id);

            return (
              <li key={p.id} className="relative">
                <Link
                  href={href}
                  aria-current={isActive ? "page" : undefined}
                  onMouseEnter={() => setHoveredId(p.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className={cn(
                    "group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                    isActive
                      ? "bg-surface-overlay text-fg-primary"
                      : "text-fg-secondary hover:bg-surface-elevated hover:text-fg-primary",
                  )}
                >
                  <BoardIcon className="size-4 shrink-0 text-fg-tertiary" />
                  <span className="flex-1 truncate">{p.name}</span>

                  {/* 즐겨찾기 버튼 */}
                  {(hoveredId === p.id || starred) && menuOpenId !== p.id ? (
                    <button
                      type="button"
                      aria-label={starred ? "즐겨찾기 해제" : "즐겨찾기 추가"}
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleToggleStar(starItem); }}
                      className={cn(
                        "flex size-5 shrink-0 items-center justify-center rounded transition-colors",
                        starred ? "text-yellow-400" : "text-fg-tertiary hover:text-yellow-400",
                      )}
                    >
                      <StarIcon className={cn("size-3.5", starred && "fill-yellow-400")} />
                    </button>
                  ) : null}

                  {/* ... 메뉴 버튼 */}
                  {hoveredId === p.id ? (
                    <button
                      type="button"
                      aria-label="프로젝트 옵션"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setMenuOpenId(menuOpenId === p.id ? null : p.id);
                      }}
                      className="flex size-5 shrink-0 items-center justify-center rounded text-fg-tertiary hover:bg-surface-overlay hover:text-fg-primary"
                    >
                      <span className="text-xs leading-none">•••</span>
                    </button>
                  ) : null}
                </Link>

                {/* 드롭다운 메뉴 */}
                {menuOpenId === p.id ? (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setMenuOpenId(null)}
                    />
                    <div className="absolute right-0 top-full z-20 mt-0.5 w-36 rounded-lg border border-border-subtle bg-surface-elevated shadow-lg">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpenId(null);
                          setConfirmDeleteId(p.id);
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-surface-overlay"
                      >
                        프로젝트 삭제
                      </button>
                    </div>
                  </>
                ) : null}
              </li>
            );
          })}
        </ul>
      </SidebarSection>

      {/* 삭제 확인 다이얼로그 */}
      {confirmDeleteId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-80 rounded-xl border border-border-subtle bg-surface-elevated p-5 shadow-xl">
            <p className="font-semibold text-fg-primary">프로젝트를 삭제할까요?</p>
            <p className="mt-1.5 text-sm text-fg-secondary">
              연결된 채널과 모든 데이터가 함께 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                disabled={isDeleting}
                className="rounded-lg px-3 py-1.5 text-sm text-fg-secondary hover:bg-surface-overlay"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-lg bg-red-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50"
              >
                {isDeleting ? "삭제 중..." : "삭제"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        workspaceId={wsId}
        onCreated={(project) => { onProjectsChange([...projects, project]); onChannelsChange(); }}
      />
    </>
  );
}
