import type { ComponentType, SVGProps } from "react";

import {
  AtSignIcon,
  CheckCircleIcon,
  InboxIcon,
  MessageSquareIcon,
} from "@/components/icons";

type KpiCardData = {
  label: string;
  value: string;
  /** 보조 수치/설명 — 예: "+3 today", "1 overdue" */
  hint: string;
  /** hint 톤 — 강조할지 경고할지. */
  hintTone?: "neutral" | "warning" | "accent";
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

/**
 * Home 상단 KPI 카드 4종.
 * 값은 키스크린에 맞춘 mock.
 */
const KPI_CARDS: ReadonlyArray<KpiCardData> = [
  {
    label: "Unread in Inbox",
    value: "12",
    hint: "+3 today",
    hintTone: "accent",
    icon: InboxIcon,
  },
  {
    label: "Due today",
    value: "3",
    hint: "1 overdue",
    hintTone: "warning",
    icon: CheckCircleIcon,
  },
  {
    label: "Active threads",
    value: "7",
    hint: "2 mentions",
    hintTone: "accent",
    icon: MessageSquareIcon,
  },
  {
    label: "Focus time",
    value: "2h 14m",
    hint: "this week",
    icon: AtSignIcon,
  },
];

export function KpiCards() {
  return (
    <section
      aria-label="주요 지표"
      className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"
    >
      {KPI_CARDS.map((card) => (
        <KpiCard key={card.label} card={card} />
      ))}
    </section>
  );
}

function KpiCard({ card }: { card: KpiCardData }) {
  const Icon = card.icon;
  const hintColor =
    card.hintTone === "warning"
      ? "text-priority-p2"
      : card.hintTone === "accent"
        ? "text-accent"
        : "text-fg-tertiary";

  return (
    <article className="rounded-lg border border-border-subtle bg-surface-subtle p-4">
      <header className="flex items-center justify-between text-fg-tertiary">
        <span className="text-xs font-medium uppercase tracking-wide">
          {card.label}
        </span>
        <Icon className="size-4" />
      </header>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-semibold text-fg-primary">
          {card.value}
        </span>
        <span className={`text-xs ${hintColor}`}>{card.hint}</span>
      </div>
    </article>
  );
}
