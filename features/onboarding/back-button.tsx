"use client";

import { useRouter } from "next/navigation";

type BackButtonProps = {
  href: string;
};

/**
 * 온보딩 카드 좌상단 뒤로가기 버튼.
 * Linear/Notion 스타일 — 작은 화살표, hover 시 배경.
 */
export function BackButton({ href }: BackButtonProps) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.push(href)}
      className="absolute left-0 top-0 flex size-8 items-center justify-center rounded-lg text-fg-tertiary transition-colors hover:bg-surface-overlay hover:text-fg-primary"
      aria-label="이전 단계로"
    >
      <svg
        className="size-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
        />
      </svg>
    </button>
  );
}
