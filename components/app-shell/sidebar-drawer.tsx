"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils/cn";
import { useAppShell } from "./app-shell-context";

/**
 * LeftRail + Sidebar 를 감싸는 반응형 컨테이너.
 *
 * - md 이상: 기존처럼 본문 왼쪽에 고정 배치
 * - md 미만: 화면 밖에 숨겨진 드로어. TopBar 햄버거로 열고,
 *   배경 탭 / 라우트 이동 / ESC 로 닫힌다.
 */
export function SidebarDrawer({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { isSidebarOpen, setSidebarOpen } = useAppShell();

  // 메뉴에서 페이지를 고르면 드로어를 닫는다.
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname, setSidebarOpen]);

  useEffect(() => {
    if (!isSidebarOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setSidebarOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isSidebarOpen, setSidebarOpen]);

  return (
    <>
      {isSidebarOpen ? (
        <button
          type="button"
          aria-label="메뉴 닫기"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
        />
      ) : null}
      <div
        // transform 대신 left 로 이동한다. transform 이 걸리면 드로어 안에서 여는
        // fixed 모달(초대/DM/삭제 확인)의 기준이 뷰포트가 아니라 드로어가 되어버린다.
        className={cn(
          "fixed inset-y-0 z-50 flex shadow-2xl transition-[left] duration-200",
          "md:static md:z-auto md:shadow-none md:transition-none",
          isSidebarOpen ? "left-0" : "-left-80",
        )}
      >
        {children}
      </div>
    </>
  );
}
