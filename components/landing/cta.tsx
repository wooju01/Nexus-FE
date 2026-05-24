import Link from "next/link";

import { Button } from "@/components/ui/button";

export function LandingCTA() {
  return (
    <section className="border-t border-border-subtle py-24">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-fg-primary sm:text-4xl">
          팀의 맥락을 한 홈으로 모으세요.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base text-fg-secondary">
          초기 10명까지 무료 — 2분 안에 워크스페이스를 만들고 바로 첫 채널을 열
          수 있습니다.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/signup">
            <Button variant="primary" size="lg" className="w-full sm:w-auto">
              무료로 시작하기
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="ghost" size="lg" className="w-full sm:w-auto">
              로그인 →
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
