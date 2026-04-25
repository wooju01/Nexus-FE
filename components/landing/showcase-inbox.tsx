import { Avatar } from "@/components/ui/avatar";
import { PriorityPill } from "@/components/ui/priority-pill";
import { Button } from "@/components/ui/button";
import {
  AtSignIcon,
  ReplyIcon,
  BoardIcon,
  CheckCircleIcon,
} from "@/components/icons";

/**
 * 쇼케이스 — 통합 인박스 & 알림 CSS 목업.
 */
export function ShowcaseInbox() {
  return (
    <div className="rounded-2xl border border-border-subtle bg-surface-elevated shadow-xl overflow-hidden">
      {/* 상단 바 */}
      <div className="flex items-center gap-4 border-b border-border-subtle px-4 py-3">
        <span className="text-sm font-medium text-fg-primary">Inbox</span>
        <div className="flex gap-1 text-xs">
          <span className="rounded-md bg-accent-subtle px-2 py-0.5 font-medium text-accent">
            All
          </span>
          <span className="rounded-md px-2 py-0.5 text-fg-tertiary">
            Mentions
          </span>
          <span className="rounded-md px-2 py-0.5 text-fg-tertiary">
            Threads
          </span>
          <span className="rounded-md px-2 py-0.5 text-fg-tertiary">
            Approvals
          </span>
        </div>
      </div>

      {/* 알림 리스트 */}
      <div className="divide-y divide-border-subtle">
        <InboxItem
          icon={<AtSignIcon width={16} height={16} className="text-accent" />}
          unread
        >
          <div className="flex items-center gap-2">
            <Avatar initials="HJ" color="blue" size="xs" />
            <p className="text-sm text-fg-primary">
              <span className="font-medium">Hana</span>
              <span className="text-fg-secondary">
                님이 #launch-q2에서 멘션했습니다
              </span>
            </p>
            <span className="ml-auto text-xs text-fg-tertiary">2분 전</span>
          </div>
        </InboxItem>

        <InboxItem
          icon={<ReplyIcon width={16} height={16} className="text-fg-secondary" />}
        >
          <div className="flex items-center gap-2">
            <Avatar initials="EP" color="purple" size="xs" />
            <p className="text-sm text-fg-secondary">
              <span className="font-medium text-fg-primary">Ethan</span>
              이 스레드에 답글을 남겼습니다
            </p>
            <span className="ml-auto text-xs text-fg-tertiary">15분 전</span>
          </div>
        </InboxItem>

        <InboxItem
          icon={<BoardIcon width={16} height={16} className="text-fg-secondary" />}
          unread
        >
          <div className="flex items-center gap-2">
            <p className="text-sm text-fg-secondary">
              <span className="font-medium text-fg-primary">NX-142</span>
              가 회원님에게 배정되었습니다
            </p>
            <PriorityPill priority="P2" />
            <span className="ml-auto text-xs text-fg-tertiary">1시간 전</span>
          </div>
        </InboxItem>

        <InboxItem
          icon={
            <CheckCircleIcon
              width={16}
              height={16}
              className="text-fg-secondary"
            />
          }
        >
          <div className="flex items-center gap-2">
            <p className="text-sm text-fg-secondary">
              <span className="font-medium text-fg-primary">
                디자인 시안 v3
              </span>{" "}
              승인 요청
            </p>
            <span className="ml-auto">
              <Button variant="primary" size="sm">
                승인
              </Button>
            </span>
          </div>
        </InboxItem>
      </div>
    </div>
  );
}

type InboxItemProps = {
  icon: React.ReactNode;
  unread?: boolean;
  children: React.ReactNode;
};

function InboxItem({ icon, unread, children }: InboxItemProps) {
  return (
    <div className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-surface-overlay">
      <div className="mt-0.5 flex-shrink-0">{icon}</div>
      <div className="min-w-0 flex-1">{children}</div>
      {unread ? (
        <span className="mt-1.5 size-2 flex-shrink-0 rounded-full bg-accent" />
      ) : null}
    </div>
  );
}
