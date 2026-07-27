"use client";

import { useEffect, useState } from "react";
import type { ComponentType, SVGProps } from "react";

import {
  AtSignIcon,
  CheckCircleIcon,
  InboxIcon,
  MessageSquareIcon,
} from "@/components/icons";
import { getAccessToken } from "@/lib/auth/tokens";
import { countUnreadApi } from "@/lib/api/notification";
import { getMyTasksApi } from "@/lib/api/task";
import { getUnreadSummaryApi } from "@/lib/api/workspace";
import { getMembersApi } from "@/lib/api/member";
import { useWorkspace } from "@/features/workspace/workspace-provider";

type KpiCardData = {
  label: string;
  value: string;
  hint: string;
  hintTone?: "neutral" | "warning" | "accent";
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

type KpiState = {
  unreadInbox: number;
  dueToday: number;
  overdueCount: number;
  unreadMessages: number;
  onlineMembers: number;
};

export function KpiCards() {
  const { currentWorkspace } = useWorkspace();
  const [kpi, setKpi] = useState<KpiState | null>(null);

  useEffect(() => {
    const token = getAccessToken();
    if (!token || !currentWorkspace) return;

    const todayStr = new Date().toISOString().slice(0, 10);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

    Promise.all([
      countUnreadApi(),
      getMyTasksApi(token),
      getUnreadSummaryApi(token, currentWorkspace.id),
      getMembersApi(currentWorkspace.id),
    ])
      .then(([{ count }, tasks, unreadSummary, members]) => {
        const dueToday = tasks.filter(
          (t) => t.dueDate && t.dueDate.slice(0, 10) === todayStr,
        ).length;
        const overdue = tasks.filter(
          (t) => t.dueDate && t.dueDate.slice(0, 10) <= yesterdayStr,
        ).length;
        const totalUnreadMessages = unreadSummary.reduce(
          (sum, item) => sum + item.unreadCount,
          0,
        );
        const online = members.filter((m) => m.user.status === "ONLINE").length;

        setKpi({
          unreadInbox: count,
          dueToday,
          overdueCount: overdue,
          unreadMessages: totalUnreadMessages,
          onlineMembers: online,
        });
      })
      .catch(console.error);
  }, [currentWorkspace]);

  const cards: KpiCardData[] = [
    {
      label: "Unread in Inbox",
      value: kpi ? String(kpi.unreadInbox) : "—",
      hint: kpi ? (kpi.unreadInbox > 0 ? "읽지 않은 알림" : "모두 읽음") : "",
      hintTone: kpi && kpi.unreadInbox > 0 ? "accent" : "neutral",
      icon: InboxIcon,
    },
    {
      label: "Due today",
      value: kpi ? String(kpi.dueToday) : "—",
      hint: kpi
        ? kpi.overdueCount > 0
          ? `${kpi.overdueCount}개 기한 초과`
          : "기한 초과 없음"
        : "",
      hintTone: kpi && kpi.overdueCount > 0 ? "warning" : "neutral",
      icon: CheckCircleIcon,
    },
    {
      label: "Unread messages",
      value: kpi ? String(kpi.unreadMessages) : "—",
      hint: kpi
        ? kpi.unreadMessages > 0
          ? "채널 · DM 합산"
          : "모두 확인함"
        : "",
      hintTone: kpi && kpi.unreadMessages > 0 ? "accent" : "neutral",
      icon: MessageSquareIcon,
    },
    {
      label: "Online teammates",
      value: kpi ? String(kpi.onlineMembers) : "—",
      hint: "현재 온라인",
      hintTone: "neutral",
      icon: AtSignIcon,
    },
  ];

  return (
    <section
      aria-label="주요 지표"
      className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"
    >
      {cards.map((card) => (
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
