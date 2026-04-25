import {
  MessagesIcon,
  SearchIcon,
  ReplyIcon,
  PeopleIcon,
  PinIcon,
  PaperclipIcon,
  SmileIcon,
  CalendarIcon,
} from "@/components/icons";

/**
 * 보조 기능 그리드 — 쇼케이스에 포함되지 않은 나머지 기능을 아이콘+짧은 설명으로 압축 노출.
 */

type Feature = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

const FEATURES: ReadonlyArray<Feature> = [
  {
    icon: <MessagesIcon />,
    title: "Conversation-first Task",
    description: "설명보다 대화가 먼저 보이는 작업 패널",
  },
  {
    icon: <SearchIcon />,
    title: "Command Palette",
    description: "어디서든 채널·사람·Task를 한 번에 검색",
  },
  {
    icon: <ReplyIcon />,
    title: "Threads",
    description: "답글 스레드로 주제별 맥락 유지",
  },
  {
    icon: <PeopleIcon />,
    title: "Presence",
    description: "누가 온라인인지 실시간 상태 표시",
  },
  {
    icon: <PinIcon />,
    title: "Pin & Bookmark",
    description: "중요 메시지를 고정하고 빠르게 접근",
  },
  {
    icon: <PaperclipIcon />,
    title: "File Sharing",
    description: "채팅·태스크에서 파일 첨부와 공유",
  },
  {
    icon: <SmileIcon />,
    title: "Emoji Reactions",
    description: "리액션으로 빠르게 피드백 전달",
  },
  {
    icon: <CalendarIcon />,
    title: "Calendar View",
    description: "일정 기반으로 태스크 타임라인 확인",
  },
];

export function LandingFeatures() {
  return (
    <section id="features" className="border-t border-border-subtle py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-14 max-w-2xl">
          <p className="mb-3 text-sm font-medium uppercase tracking-wider text-accent">
            더 많은 기능
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-fg-primary sm:text-4xl">
            팀에 필요한 모든 것, 하나의 제품에.
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <article
              key={feature.title}
              className="group rounded-xl border border-border-subtle bg-surface-elevated p-5 transition-colors hover:border-border-default"
            >
              <div className="mb-3 flex size-9 items-center justify-center rounded-lg bg-accent-subtle text-accent">
                {feature.icon}
              </div>
              <h3 className="mb-1 text-sm font-semibold text-fg-primary">
                {feature.title}
              </h3>
              <p className="text-xs leading-5 text-fg-secondary">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
