/**
 * 핵심 가치 4카드 — docs/product.md 1. 핵심 가치 제안과 일치시킨다.
 */

type ValueCard = {
  title: string;
  description: string;
};

const VALUE_CARDS: ReadonlyArray<ValueCard> = [
  {
    title: "Context preservation",
    description:
      "채널의 대화가 자연스럽게 Task·Project·Doc으로 양방향 연결됩니다. #launch-q2 ↔ Launch · Q2 보드가 자동으로 묶여요.",
  },
  {
    title: "Single home",
    description:
      "Inbox · Mentions · My tasks · Approvals를 한 화면에서. 탭을 뒤적이지 않아도 팀의 맥락이 모입니다.",
  },
  {
    title: "Real-time",
    description:
      "스레드·프레즌스·타이핑 인디케이터·보드 상태가 즉시 반영. 누가 무엇을 하고 있는지 항상 최신입니다.",
  },
  {
    title: "AI-native",
    description:
      "Daily digest와 Summarize thread가 워크플로우에 내장. 긴 스레드도 한 문단으로 따라잡습니다.",
  },
];

export function LandingValues() {
  return (
    <section id="values" className="border-t border-border-subtle py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-14 max-w-2xl">
          <p className="mb-3 text-sm font-medium uppercase tracking-wider text-accent">
            Why Nexus
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-fg-primary sm:text-4xl">
            맥락을 잃지 않는 협업,
            <br />
            팀의 속도를 되찾는 설계.
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {VALUE_CARDS.map((card) => (
            <article
              key={card.title}
              className="rounded-xl border border-border-subtle bg-surface-elevated p-6 transition-colors hover:border-border-default"
            >
              <h3 className="mb-2 text-base font-semibold text-fg-primary">
                {card.title}
              </h3>
              <p className="text-sm leading-6 text-fg-secondary">
                {card.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
