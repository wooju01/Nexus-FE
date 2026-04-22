/**
 * 로드맵 — docs/product.md 7. 로드맵(초안)을 사용자 대면 카피로 요약.
 */

type Milestone = {
  label: string;
  duration: string;
  items: ReadonlyArray<string>;
  isCurrent?: boolean;
};

const MILESTONES: ReadonlyArray<Milestone> = [
  {
    label: "M1 · Foundation",
    duration: "4주",
    items: ["인증·워크스페이스", "Channels·Messages", "Threads·Inbox 기본"],
    isCurrent: true,
  },
  {
    label: "M2 · Projects & Tasks",
    duration: "4주",
    items: ["Projects·Board·Table", "Task CRUD", "채널 ↔ 보드 연결"],
  },
  {
    label: "M3 · Home & Realtime",
    duration: "3주",
    items: ["Home 대시보드", "Presence·알림", "⌘K 검색"],
  },
  {
    label: "M4 · AI & Polish",
    duration: "3주",
    items: ["Daily digest", "Summarize thread", "모바일·접근성 감사"],
  },
];

export function LandingRoadmap() {
  return (
    <section
      id="roadmap"
      className="border-t border-border-subtle bg-surface-subtle py-24"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-14 max-w-2xl">
          <p className="mb-3 text-sm font-medium uppercase tracking-wider text-accent">
            Roadmap
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-fg-primary sm:text-4xl">
            지금 어디까지 와 있나요?
          </h2>
          <p className="mt-4 text-base text-fg-secondary">
            Nexus는 지금 M1 Foundation 단계입니다. 인증과 기본 협업 기능을 먼저
            마련하고, 점진적으로 AI 어시스트까지 확장합니다.
          </p>
        </div>

        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MILESTONES.map((m) => (
            <li
              key={m.label}
              className={
                m.isCurrent
                  ? "rounded-xl border border-accent/60 bg-accent-subtle/40 p-6"
                  : "rounded-xl border border-border-subtle bg-surface-elevated p-6"
              }
            >
              <div className="mb-2 flex items-baseline justify-between">
                <h3 className="text-sm font-semibold text-fg-primary">
                  {m.label}
                </h3>
                <span className="text-xs text-fg-tertiary">{m.duration}</span>
              </div>
              {m.isCurrent ? (
                <span className="mb-3 inline-block rounded-full bg-accent px-2 py-0.5 text-[10px] font-medium text-fg-primary">
                  진행 중
                </span>
              ) : null}
              <ul className="space-y-1.5 text-sm text-fg-secondary">
                {m.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
