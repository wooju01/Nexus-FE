"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { SearchIcon } from "@/components/icons";

type BoardSearchProps = {
  /** URL ?q= 의 초기값. 부모(board-view)가 useSearchParams 로 읽어서 전달. */
  initialValue: string;
};

/**
 * 보드 헤더 검색 input.
 *
 * - 입력 즉시 로컬 state 반영(부드러운 타이핑) → 300ms debounce 후 URL ?q= 갱신
 * - 빈 값이면 ?q= 자체를 제거
 * - 다른 query (task / assignee / label / priority) 는 보존
 * - 실제 매칭(제목/NX-번호) 은 board-view 의 필터 로직에서 처리
 */
export function BoardSearch({ initialValue }: BoardSearchProps) {
  const router = useRouter();
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    const timer = setTimeout(() => {
      // window.location.search 를 직접 읽어 다른 query 와 충돌 방지.
      const next = new URLSearchParams(window.location.search);
      const trimmed = value.trim();
      if (trimmed) next.set("q", trimmed);
      else next.delete("q");
      const s = next.toString();
      router.replace(s ? `?${s}` : "?", { scroll: false });
    }, 300);
    return () => clearTimeout(timer);
  }, [value, router]);

  return (
    <div className="relative">
      <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-fg-tertiary" />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="제목 · NX-번호 검색"
        aria-label="보드 검색"
        className="h-7 w-48 rounded-md border border-border-subtle bg-surface-elevated pl-7 pr-2 text-xs text-fg-primary placeholder:text-fg-tertiary focus:outline-none focus:ring-1 focus:ring-accent"
      />
    </div>
  );
}
