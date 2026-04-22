import Link from "next/link";

import { Logo } from "@/components/brand/logo";

export function LandingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border-subtle bg-surface-subtle py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-6 sm:flex-row sm:items-center">
        <div className="flex flex-col gap-2">
          <Logo />
          <p className="text-xs text-fg-tertiary">
            Aether Labs · Chat, tasks, and docs. Connected.
          </p>
        </div>

        <nav aria-label="푸터 링크">
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-fg-secondary">
            <li>
              <Link
                href="/login"
                className="hover:text-fg-primary transition-colors"
              >
                로그인
              </Link>
            </li>
            <li>
              <Link
                href="/signup"
                className="hover:text-fg-primary transition-colors"
              >
                회원가입
              </Link>
            </li>
            <li>
              <a
                href="https://github.com/wooju01/Nexus-FE"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-fg-primary transition-colors"
              >
                GitHub
              </a>
            </li>
          </ul>
        </nav>

        <p className="text-xs text-fg-tertiary">
          © {year} Aether Labs. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
