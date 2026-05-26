import { BoardIcon } from "@/components/icons";

/**
 * /projects 랜딩 페이지
 * Boards Rail 클릭 시 진입하는 페이지.
 * 왼쪽 Sidebar에서 프로젝트를 선택하면 /projects/[slug]로 이동.
 */
export default function ProjectsPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-surface-elevated text-fg-tertiary">
        <BoardIcon className="size-8" />
      </div>
      <div>
        <p className="text-base font-semibold text-fg-primary">프로젝트를 선택하세요</p>
        <p className="mt-1 text-sm text-fg-tertiary">
          왼쪽에서 프로젝트를 선택하거나 새 프로젝트를 만드세요.
        </p>
      </div>
    </div>
  );
}
