import Link from "next/link";

import { Button } from "@/components/ui/button";

/**
 * Hero 섹션.
 * - 좌측: 헤드라인 + 서브카피 + CTA 2개
 * - 우측: 대시보드 미리보기 mock (순수 CSS 구성, 이미지 자원 미도입 상태이므로 그라디언트+카드로 암시)
 */
export function LandingHero() {
  return (
    <section>
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-6 py-20 lg:grid-cols-[1.05fr_1fr] lg:py-28">
        <div className="flex flex-col justify-center">
          <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight text-fg-primary sm:text-5xl lg:text-6xl">
            팀의 대화·작업·문서,
            <br />
            하나로 연결된 홈.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-fg-secondary">
            Slack의 대화, Linear의 이슈, Notion의 문서를 단일 제품 경험으로.
            <br className="hidden sm:block" />
            10~200명 팀을 위한 AI-native 협업 대시보드, Nexus.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/signup">
              <Button variant="primary" size="lg" className="w-full sm:w-auto">
                무료로 시작하기
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                이미 계정이 있어요
              </Button>
            </Link>
          </div>

          <p className="mt-4 text-xs text-fg-tertiary">
            신용카드 불필요 · 초기 워크스페이스 10명까지 무료
          </p>
        </div>

        <HeroPreview />
      </div>
    </section>
  );
}

/**
 * 대시보드 프리뷰 — 순수 Tailwind로 구성된 시각적 암시물.
 * 실제 스크린샷은 M1 이후 교체.
 */
function HeroPreview() {
  return (
    <div className="relative hidden lg:block">
      <div className="absolute inset-0 rounded-2xl border border-border-subtle bg-surface-elevated shadow-2xl">
        <div className="flex items-center border-b border-border-subtle px-4 py-3">
          <span className="text-xs text-fg-tertiary">
            # launch-q2 — 8 members
          </span>
        </div>
        <div className="grid grid-cols-[180px_1fr] h-[calc(100%-44px)]">
          <aside className="border-r border-border-subtle bg-surface-subtle p-3 text-xs text-fg-secondary">
            <p className="mb-2 px-2 text-[10px] uppercase tracking-wider text-fg-tertiary">
              Channels
            </p>
            <ul className="space-y-1">
              <li className="rounded-md bg-surface-overlay px-2 py-1.5 text-fg-primary">
                # launch-q2
              </li>
              <li className="px-2 py-1.5"># product-design</li>
              <li className="px-2 py-1.5"># engineering</li>
              <li className="px-2 py-1.5"># general</li>
            </ul>
            <p className="mt-5 mb-2 px-2 text-[10px] uppercase tracking-wider text-fg-tertiary">
              Linked board
            </p>
            <div className="rounded-md border border-border-subtle px-2 py-1.5 text-fg-primary">
              Launch · Q2
            </div>
          </aside>
          <div className="flex flex-col p-4">
            <MessageCard
              author="Hana Jeong"
              time="2m"
              body="Landing hero copy v3 확인해주세요. P2로 올려두었어요."
              badge={{ label: "P2", color: "bg-priority-p2/20 text-priority-p2" }}
            />
            <MessageCard
              author="Ethan Park"
              time="just now"
              body="NX-142 리뷰 마무리 중. 스레드에서 이어갑시다."
              badge={{ label: "NX-142", color: "bg-accent-subtle text-accent" }}
            />
            <div className="mt-auto rounded-lg border border-border-subtle bg-surface-overlay p-2 text-xs text-fg-tertiary">
              메시지 입력…
            </div>
          </div>
        </div>
      </div>
      {/* 카드 종횡비 유지용 spacer */}
      <div className="aspect-[5/4]" />
    </div>
  );
}

type MessageCardProps = {
  author: string;
  time: string;
  body: string;
  badge: { label: string; color: string };
};

function MessageCard({ author, time, body, badge }: MessageCardProps) {
  return (
    <div className="mb-3 rounded-lg border border-border-subtle bg-surface-subtle p-3">
      <div className="mb-1 flex items-center gap-2 text-xs">
        <span className="font-medium text-fg-primary">{author}</span>
        <span className="text-fg-tertiary">{time}</span>
        <span
          className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-medium ${badge.color}`}
        >
          {badge.label}
        </span>
      </div>
      <p className="text-sm text-fg-secondary">{body}</p>
    </div>
  );
}
