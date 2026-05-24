import { Avatar } from "@/components/ui/avatar";
import { PriorityPill } from "@/components/ui/priority-pill";
import {
  HashIcon,
  PeopleIcon,
  SmileIcon,
  PaperclipIcon,
  ReplyIcon,
} from "@/components/icons";

/**
 * 쇼케이스 — 실시간 채팅 & 스레드 CSS 목업.
 * 나중에 실제 스크린샷 이미지로 교체 가능.
 */
export function ShowcaseChat() {
  return (
    <div className="rounded-2xl border border-border-subtle bg-surface-elevated shadow-xl overflow-hidden">
      {/* 채널 상단 바 */}
      <div className="flex items-center gap-2 border-b border-border-subtle px-4 py-3">
        <HashIcon className="text-fg-tertiary" width={16} height={16} />
        <span className="text-sm font-medium text-fg-primary">launch-q2</span>
        <span className="ml-auto flex items-center gap-1 text-xs text-fg-tertiary">
          <PeopleIcon width={14} height={14} />8
        </span>
      </div>

      {/* 메시지 영역 */}
      <div className="flex flex-col gap-1 p-4">
        <ChatMessage
          initials="HJ"
          color="blue"
          name="Hana Jeong"
          time="오후 2:34"
          presence="online"
        >
          <p className="text-sm text-fg-secondary">
            Landing hero copy v3 확인해주세요.{" "}
            <PriorityPill priority="P2" />로 올려두었어요.
          </p>
        </ChatMessage>

        <ChatMessage
          initials="EP"
          color="purple"
          name="Ethan Park"
          time="오후 2:36"
        >
          <p className="text-sm text-fg-secondary">
            NX-142 리뷰 마무리 중입니다. 스레드에서 이어갑시다.
          </p>
          {/* 스레드 힌트 */}
          <button
            type="button"
            className="mt-2 flex items-center gap-1.5 text-xs text-accent hover:text-accent-hover transition-colors"
          >
            <ReplyIcon width={14} height={14} />
            <span className="font-medium">3개의 답글</span>
            <span className="flex -space-x-1">
              <Avatar initials="HJ" color="blue" size="xs" />
              <Avatar initials="SY" color="green" size="xs" />
            </span>
          </button>
        </ChatMessage>

        <ChatMessage
          initials="SY"
          color="green"
          name="Soyeon Kim"
          time="방금"
          presence="online"
        >
          <p className="text-sm text-fg-secondary">
            API 스키마 변경 건 정리했습니다. breaking change 없어요!
          </p>
        </ChatMessage>

        {/* 입력창 */}
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-border-subtle bg-surface-overlay px-3 py-2.5">
          <span className="flex-1 text-sm text-fg-tertiary">
            메시지 입력…
          </span>
          <SmileIcon
            width={16}
            height={16}
            className="text-fg-tertiary"
          />
          <PaperclipIcon
            width={16}
            height={16}
            className="text-fg-tertiary"
          />
        </div>
      </div>
    </div>
  );
}

type ChatMessageProps = {
  initials: string;
  color: "blue" | "purple" | "green" | "pink" | "orange" | "yellow" | "teal";
  name: string;
  time: string;
  presence?: "online" | "offline";
  children: React.ReactNode;
};

function ChatMessage({
  initials,
  color,
  name,
  time,
  presence,
  children,
}: ChatMessageProps) {
  return (
    <div className="flex gap-3 rounded-lg p-2 transition-colors hover:bg-surface-overlay">
      <Avatar initials={initials} color={color} size="sm" presence={presence} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium text-fg-primary">{name}</span>
          <span className="text-xs text-fg-tertiary">{time}</span>
        </div>
        {children}
      </div>
    </div>
  );
}
