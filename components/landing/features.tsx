/**
 * 주요 기능 섹션 — docs/product.md 2. 주요 기능 목록을 3~4 그룹으로 축약 노출.
 */

type Feature = {
  title: string;
  description: string;
  tag: string;
};

const FEATURES: ReadonlyArray<Feature> = [
  {
    tag: "Channels",
    title: "실시간 채팅 + 스레드",
    description:
      "Public·Private 채널, 이모지 리액션, 핀, 답글 스레드. Send & create task로 메시지를 그대로 Task로 승격하세요.",
  },
  {
    tag: "Projects",
    title: "Board · Table · Timeline · Calendar",
    description:
      "4가지 뷰로 프로젝트를 관리합니다. WIP 카운터가 있는 Kanban, 필터·그룹·검색이 기본 내장.",
  },
  {
    tag: "Task Detail",
    title: "Conversation-first 작업 패널",
    description:
      "Description보다 대화가 먼저 보이는 Task. Linked channel 자동 연결로 의사결정의 근거가 함께 따라옵니다.",
  },
  {
    tag: "Inbox",
    title: "멘션·답글·승인의 단일 홈",
    description:
      "워크스페이스의 모든 알림을 한곳에. 읽음·스누즈·출처 링크로 맥락을 잃지 않고 정리할 수 있습니다.",
  },
  {
    tag: "Search",
    title: "⌘K 커맨드 팔레트",
    description:
      "채널·사람·Task·메시지·파일을 한 번의 단축키로. 어디서든 점프할 수 있습니다.",
  },
  {
    tag: "AI",
    title: "Daily digest · Summarize thread",
    description:
      "하루를 요약해주는 digest와 긴 스레드를 한 문단으로 압축하는 AI 어시스트가 워크플로우에 내장.",
  },
];

export function LandingFeatures() {
  return (
    <section id="features" className="border-t border-border-subtle py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-14 max-w-2xl">
          <p className="mb-3 text-sm font-medium uppercase tracking-wider text-accent">
            What&rsquo;s inside
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-fg-primary sm:text-4xl">
            매일 쓰는 기능, 하나의 맥락으로.
          </h2>
        </div>

        <div className="grid gap-px overflow-hidden rounded-xl border border-border-subtle bg-border-subtle sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <article
              key={feature.title}
              className="bg-surface-base p-6 transition-colors hover:bg-surface-elevated"
            >
              <span className="mb-3 inline-block rounded-full bg-surface-elevated px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-fg-secondary">
                {feature.tag}
              </span>
              <h3 className="mb-2 text-base font-semibold text-fg-primary">
                {feature.title}
              </h3>
              <p className="text-sm leading-6 text-fg-secondary">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
