import Link from "next/link";

import { Logo } from "@/components/brand/logo";

type AuthLayoutProps = {
  children: React.ReactNode;
};

/**
 * 인증 라우트(route group `(auth)`) 공용 레이아웃.
 * - 좌측: 브랜드 / 카피
 * - 우측: 카드 폼 (children)
 * - 모바일에서는 단일 컬럼.
 *
 * 주의: 이 레이아웃은 루트 레이아웃을 대체하지 않음(그룹 루트가 아니라 중첩). 최상위 <html>은 app/layout.tsx.
 */
export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="grid min-h-dvh grid-cols-1 lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden border-r border-border-subtle bg-surface-subtle lg:block">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-120px] top-[-120px] size-[520px] rounded-full bg-accent/25 blur-[140px]" />
          <div className="absolute bottom-[-120px] right-[-80px] size-[420px] rounded-full bg-brand-glow/20 blur-[140px]" />
        </div>

        <div className="relative flex h-full flex-col justify-between p-12">
          <Link href="/" aria-label="Nexus 홈" className="w-fit">
            <Logo />
          </Link>

          <div>
            <h2 className="max-w-md text-3xl font-semibold leading-tight tracking-tight text-fg-primary">
              팀의 대화·작업·문서,
              <br />
              맥락을 잃지 않는 단 하나의 홈.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-6 text-fg-secondary">
              Slack의 대화, Linear의 이슈, Notion의 문서를 한 제품 경험으로.
              Aether Labs가 만드는 실시간 협업 대시보드 Nexus에 오신 것을
              환영합니다.
            </p>
          </div>

          <p className="text-xs text-fg-tertiary">
            © {new Date().getFullYear()} Aether Labs
          </p>
        </div>
      </aside>

      <main className="flex items-center justify-center bg-surface-base px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <Link href="/" aria-label="Nexus 홈">
              <Logo />
            </Link>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
