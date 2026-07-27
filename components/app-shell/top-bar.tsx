"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  CalendarIcon,
  ChevronDownIcon,
  SparklesIcon,
} from "@/components/icons";
import { Avatar } from "@/components/ui/avatar";
import { useUser } from "@/features/auth/user-provider";
import { useWorkspace } from "@/features/workspace/workspace-provider";
import { clearTokens } from "@/lib/auth/tokens";
import type { Presence } from "@/types/domain";
import { cn } from "@/lib/utils/cn";

const STATUS_MAP: Record<string, Presence> = {
  ONLINE: "online",
  AWAY: "away",
  DND: "dnd",
  OFFLINE: "offline",
};

export function TopBar() {
  const router = useRouter();
  const { user, isLoading } = useUser();
  const { currentWorkspace, workspaces, switchWorkspace } = useWorkspace();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const userButtonRef = useRef<HTMLButtonElement>(null);

  const [isWsSwitcherOpen, setIsWsSwitcherOpen] = useState(false);
  const wsSwitcherRef = useRef<HTMLDivElement>(null);
  const wsSwitcherButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node) &&
        !userButtonRef.current?.contains(e.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
      if (
        wsSwitcherRef.current &&
        !wsSwitcherRef.current.contains(e.target as Node) &&
        !wsSwitcherButtonRef.current?.contains(e.target as Node)
      ) {
        setIsWsSwitcherOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleUserMenuToggle() {
    setIsUserMenuOpen((prev) => !prev);
    setIsWsSwitcherOpen(false);
  }

  function handleWsSwitcherToggle() {
    setIsWsSwitcherOpen((prev) => !prev);
    setIsUserMenuOpen(false);
  }

  function handleSwitchWorkspace(ws: NonNullable<typeof currentWorkspace>) {
    switchWorkspace(ws);
    setIsWsSwitcherOpen(false);
  }

  function handleLogout() {
    clearTokens();
    router.push("/login");
  }

  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b border-border-subtle bg-surface-base px-4">
      {/* 워크스페이스 스위처 */}
      <div className="relative">
        <button
          ref={wsSwitcherButtonRef}
          type="button"
          onClick={handleWsSwitcherToggle}
          aria-label="워크스페이스 전환"
          aria-expanded={isWsSwitcherOpen}
          className={cn(
            "flex items-center gap-2 rounded-lg px-2 py-1 text-sm font-semibold tracking-tight transition-colors",
            isWsSwitcherOpen ? "bg-surface-elevated" : "hover:bg-surface-elevated",
          )}
        >
          <span className="text-fg-primary">Nexus</span>
          <span aria-hidden="true" className="text-fg-tertiary">/</span>
          <span className="text-fg-primary">
            {currentWorkspace?.name ?? "워크스페이스"}
          </span>
          <ChevronDownIcon
            className={cn(
              "size-3.5 text-fg-tertiary transition-transform",
              isWsSwitcherOpen && "rotate-180",
            )}
          />
        </button>

        {isWsSwitcherOpen ? (
          <div
            ref={wsSwitcherRef}
            className="absolute left-0 top-11 z-50 w-56 rounded-xl border border-border-subtle bg-surface-base shadow-2xl"
          >
            <div className="p-1">
              <p className="px-3 py-1.5 text-[11px] font-medium text-fg-tertiary uppercase tracking-wide">
                워크스페이스
              </p>
              {workspaces.map((ws) => (
                <button
                  key={ws.id}
                  type="button"
                  onClick={() => handleSwitchWorkspace(ws)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                    ws.id === currentWorkspace?.id
                      ? "bg-surface-elevated text-fg-primary font-medium"
                      : "text-fg-secondary hover:bg-surface-elevated hover:text-fg-primary",
                  )}
                >
                  <span className="flex size-6 shrink-0 items-center justify-center rounded bg-accent text-[10px] font-bold text-white">
                    {ws.name.slice(0, 2).toUpperCase()}
                  </span>
                  <span className="truncate">{ws.name}</span>
                  {ws.id === currentWorkspace?.id && (
                    <svg
                      className="ml-auto size-3.5 shrink-0 text-accent"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex flex-1" />

      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label="AI 어시스트"
          className="flex size-9 items-center justify-center rounded-lg text-fg-secondary hover:bg-surface-elevated hover:text-fg-primary"
        >
          <SparklesIcon />
        </button>

        <Link
          href="/calendar"
          aria-label="캘린더"
          className="flex size-9 items-center justify-center rounded-lg text-fg-secondary hover:bg-surface-elevated hover:text-fg-primary"
        >
          <CalendarIcon />
        </Link>

        {/* 유저 메뉴 */}
        <div className="relative ml-2">
          <button
            ref={userButtonRef}
            type="button"
            onClick={handleUserMenuToggle}
            aria-label="사용자 메뉴"
            aria-expanded={isUserMenuOpen}
            className={cn(
              "flex items-center gap-2 rounded-lg px-2 py-1 transition-colors",
              isUserMenuOpen
                ? "bg-surface-elevated"
                : "hover:bg-surface-elevated",
            )}
          >
            <Avatar
              initials={user?.name?.slice(0, 2).toUpperCase() ?? "??"}
              color="blue"
              presence={user?.status ? STATUS_MAP[user.status] : undefined}
              size="md"
              name={user?.name ?? ""}
            />
            <span className="text-sm font-medium text-fg-primary" suppressHydrationWarning>
              {isLoading ? "..." : (user?.name ?? "사용자")}
            </span>
            <ChevronDownIcon
              className={cn(
                "size-3.5 text-fg-tertiary transition-transform",
                isUserMenuOpen && "rotate-180",
              )}
            />
          </button>

          {isUserMenuOpen ? (
            <div
              ref={userMenuRef}
              className="absolute right-0 top-11 z-50 w-44 rounded-xl border border-border-subtle bg-surface-base shadow-2xl"
            >
              <div className="p-1">
                <Link
                  href="/settings/profile"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-fg-secondary transition-colors hover:bg-surface-elevated hover:text-fg-primary"
                >
                  <svg
                    className="size-4 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0"
                    />
                  </svg>
                  프로필 설정
                </Link>

                <div className="my-1 border-t border-border-subtle" />

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-priority-p1 transition-colors hover:bg-priority-p1/10"
                >
                  <svg
                    className="size-4 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"
                    />
                  </svg>
                  로그아웃
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
