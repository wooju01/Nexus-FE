"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { cn } from "@/lib/utils/cn";

/**
 * 개발용 플로팅 네비게이터.
 *
 * 의도: 아직 전역 네비가 확정되지 않은 스캐폴드 단계에서,
 *       주요 라우트(랜딩·로그인·회원가입)로 빠르게 점프하기 위한 개발자 전용 UI.
 *
 * 마운트 조건: `process.env.NODE_ENV === "development"` 일 때만 렌더
 *       (루트 layout에서 조건부로 마운트되지만 안전하게 내부에서도 한 번 더 체크).
 *
 * 접근성: 토글 버튼은 aria-expanded로 상태 노출, ESC로 닫기.
 * 단축키: `Alt + \` 로 토글 (⌘K 글로벌 검색과 충돌 회피).
 *
 * App Router에선 layout 내 state가 클라이언트 네비게이션 간 유지되므로
 * 별도 영속화는 하지 않는다. 페이지 새로고침 시에만 초기화.
 *
 * 새 라우트 추가 시 아래 `DEV_ROUTES` 배열만 업데이트.
 */

type DevRoute = {
  href: string;
  label: string;
  hint?: string;
};

const DEV_ROUTES: ReadonlyArray<DevRoute> = [
  { href: "/", label: "랜딩", hint: "/" },
  { href: "/login", label: "로그인", hint: "/login" },
  { href: "/signup", label: "회원가입", hint: "/signup" },
  { href: "/dashboard", label: "대시보드", hint: "/dashboard" },
  {
    href: "/projects/launch-q2",
    label: "보드 · Launch Q2",
    hint: "/projects/…",
  },
  {
    href: "/projects/launch-q2?task=NX-142",
    label: "보드 · 상세 페인",
    hint: "?task=NX-142",
  },
  {
    href: "/channels/launch-q2",
    label: "채널 · #launch-q2",
    hint: "/channels/…",
  },
  {
    href: "/channels/launch-q2?thread=msg-5",
    label: "채널 · 스레드 패널",
    hint: "?thread=msg-5",
  },
  { href: "/profile", label: "온보딩 · 프로필", hint: "/profile" },
  { href: "/workspace", label: "온보딩 · 워크스페이스", hint: "/workspace" },
  { href: "/complete", label: "온보딩 · 완료", hint: "/complete" },
];

export function DevNav() {
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return <DevNavClient />;
}

function DevNavClient() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);
  const close = useCallback(() => setIsOpen(false), []);

  // Alt + \ 단축키 + ESC로 닫기.
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.altKey && event.key === "\\") {
        event.preventDefault();
        setIsOpen((prev) => !prev);
        return;
      }
      if (event.key === "Escape") {
        setIsOpen((prev) => (prev ? false : prev));
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2 print:hidden">
      {isOpen ? (
        <nav
          aria-label="개발용 빠른 이동"
          className="w-56 rounded-xl border border-border-default bg-surface-elevated p-2 shadow-2xl"
        >
          <div className="mb-1 flex items-center justify-between px-2 py-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-fg-tertiary">
              Dev nav
            </span>
            <kbd className="rounded bg-surface-overlay px-1.5 py-0.5 text-[10px] text-fg-tertiary">
              Alt + \
            </kbd>
          </div>
          <ul className="space-y-0.5">
            {DEV_ROUTES.map((route) => {
              const isActive = pathname === route.href;
              return (
                <li key={route.href}>
                  <Link
                    href={route.href}
                    onClick={close}
                    className={cn(
                      "flex items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors",
                      isActive
                        ? "bg-accent-subtle text-fg-primary"
                        : "text-fg-secondary hover:bg-surface-overlay hover:text-fg-primary",
                    )}
                  >
                    <span>{route.label}</span>
                    {route.hint ? (
                      <span className="text-[10px] text-fg-tertiary">
                        {route.hint}
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      ) : null}

      <button
        type="button"
        onClick={toggle}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Dev nav 닫기" : "Dev nav 열기"}
        className={cn(
          "size-11 rounded-full border text-sm font-semibold shadow-lg transition-colors",
          "flex items-center justify-center",
          isOpen
            ? "border-accent bg-accent text-fg-primary"
            : "border-border-default bg-surface-elevated text-fg-primary hover:border-accent",
        )}
      >
        {isOpen ? "×" : "Dev"}
      </button>
    </div>
  );
}
