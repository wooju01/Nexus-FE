"use client";

import { useEffect, useState } from "react";

import { getAccessToken } from "@/lib/auth/tokens";
import { getMyTasksApi } from "@/lib/api/task";
import { useUser } from "@/features/auth/user-provider";

function greetingFor(now: Date): string {
  const h = now.getHours();
  if (h < 5) return "아직도 안 주무세요";
  if (h < 12) return "좋은 아침이에요";
  if (h < 18) return "좋은 오후에요";
  return "좋은 저녁이에요";
}

function buildSubtitle(dueToday: number, total: number): string {
  if (total === 0) return "오늘 할당된 태스크가 없어요. 여유를 즐겨보세요.";
  if (dueToday > 0)
    return `오늘 마감인 태스크가 ${dueToday}개 있어요. 총 ${total}개가 진행 중이에요.`;
  return `진행 중인 태스크가 ${total}개 있어요.`;
}

export function Greeting() {
  const { user } = useUser();
  const firstName = user?.name?.split(" ")[0] ?? "";
  const headline = `${greetingFor(new Date())}, ${firstName}`;

  const [subtitle, setSubtitle] = useState<string | null>(null);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;

    const todayStr = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

    getMyTasksApi(token)
      .then((tasks) => {
        const dueToday = tasks.filter(
          (t) => t.dueDate && t.dueDate.slice(0, 10) <= todayStr,
        ).length;
        setSubtitle(buildSubtitle(dueToday, tasks.length));
      })
      .catch(() => setSubtitle(null));
  }, []);

  return (
    <section className="mb-6">
      <h1 className="text-2xl font-semibold tracking-tight text-fg-primary">
        {headline}
      </h1>
      {subtitle ? (
        <p className="mt-1 text-sm text-fg-secondary">{subtitle}</p>
      ) : null}
    </section>
  );
}
