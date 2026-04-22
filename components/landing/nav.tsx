import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

/**
 * 랜딩 상단 네비게이션. Sticky 고정 + 섹션 앵커 링크.
 * 모바일에서는 섹션 링크를 숨기고 CTA만 노출한다.
 */
export function LandingNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border-subtle bg-surface-base/80 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          aria-label="Nexus 홈"
          className="outline-none rounded-md"
        >
          <Logo />
        </Link>

        <ul className="hidden items-center gap-8 text-sm text-fg-secondary md:flex">
          <li>
            <a href="#values" className="hover:text-fg-primary transition-colors">
              핵심 가치
            </a>
          </li>
          <li>
            <a
              href="#features"
              className="hover:text-fg-primary transition-colors"
            >
              기능
            </a>
          </li>
          <li>
            <a
              href="#roadmap"
              className="hover:text-fg-primary transition-colors"
            >
              로드맵
            </a>
          </li>
        </ul>

        <div className="flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              로그인
            </Button>
          </Link>
          <Link href="/signup">
            <Button variant="primary" size="sm">
              시작하기
            </Button>
          </Link>
        </div>
      </nav>
    </header>
  );
}
