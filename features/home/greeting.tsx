"use client";
import { useUser } from "@/features/auth/user-provider";

/**
 * 간단한 시간대별 인사말 — 서버에서 번들되므로 비용 없음.
 */
function greetingFor(now: Date): string {
  const h = now.getHours();
  if (h < 5) return "Still up";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

/**
 * Home 상단 인사말 + 짧은 상태 요약.
 */
export function Greeting() {
  const { user } = useUser();
  const firstName = user?.name?.split(" ")[0] ?? "";
  const headline = `${greetingFor(new Date())}, ${firstName}`;

  return (
    <section className="mb-6">
      <h1 className="text-2xl font-semibold tracking-tight text-fg-primary">
        {headline}
      </h1>
      <p className="mt-1 text-sm text-fg-secondary">
        오늘 5개의 할 일이 있고, 3개가 다른 사람의 피드백을 기다리고 있어요.
      </p>
    </section>
  );
}
