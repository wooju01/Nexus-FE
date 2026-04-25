import { PriorityPill } from "@/components/ui/priority-pill";
import { SparklesIcon } from "@/components/icons";

/**
 * 쇼케이스 — AI 요약 & 다이제스트 CSS 목업.
 */
export function ShowcaseAI() {
  return (
    <div className="rounded-2xl border border-border-subtle bg-surface-elevated shadow-xl overflow-hidden">
      {/* 상단 바 */}
      <div className="flex items-center gap-2 border-b border-border-subtle px-4 py-3">
        <SparklesIcon width={16} height={16} className="text-accent" />
        <span className="text-sm font-medium text-fg-primary">
          Daily Digest
        </span>
        <span className="ml-auto text-xs text-fg-tertiary">
          2026년 4월 24일
        </span>
      </div>

      <div className="flex flex-col gap-4 p-4">
        {/* 채널 하이라이트 */}
        <div>
          <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-fg-tertiary">
            채널 하이라이트
          </h4>
          <div className="space-y-2">
            <DigestBlock channel="#launch-q2">
              랜딩 페이지 카피 v3 확정, 디자인 리뷰 진행 중. Hana가 최종
              시안을 공유함.
            </DigestBlock>
            <DigestBlock channel="#engineering">
              API 스키마 변경 논의 완료 — breaking change 없음. 배포
              일정 확인 필요.
            </DigestBlock>
          </div>
        </div>

        {/* 태스크 업데이트 */}
        <div>
          <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-fg-tertiary">
            내 태스크 업데이트
          </h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2 rounded-lg border border-border-subtle bg-surface-overlay px-3 py-2">
              <span className="text-xs font-medium text-fg-primary">
                NX-142
              </span>
              <span className="text-xs text-status-in-progress">
                In Progress
              </span>
              <span className="text-xs text-fg-tertiary">→</span>
              <span className="text-xs text-status-in-review">In Review</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-border-subtle bg-surface-overlay px-3 py-2">
              <span className="text-xs font-medium text-fg-primary">
                NX-158
              </span>
              <span className="text-xs text-fg-secondary">새로 배정됨</span>
              <PriorityPill priority="P1" />
            </div>
          </div>
        </div>

        {/* 스레드 요약 버튼 */}
        <button
          type="button"
          className="flex items-center justify-center gap-2 rounded-lg border border-border-subtle bg-surface-overlay px-4 py-2.5 text-sm text-fg-secondary transition-colors hover:border-accent hover:text-accent"
        >
          <SparklesIcon width={16} height={16} />
          스레드 요약하기
        </button>
      </div>
    </div>
  );
}

type DigestBlockProps = {
  channel: string;
  children: React.ReactNode;
};

function DigestBlock({ channel, children }: DigestBlockProps) {
  return (
    <div className="rounded-lg border-l-2 border-accent-subtle bg-surface-overlay px-3 py-2">
      <span className="mb-1 block text-xs font-medium text-accent">
        {channel}
      </span>
      <p className="text-xs leading-5 text-fg-secondary">{children}</p>
    </div>
  );
}
