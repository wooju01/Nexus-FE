import { getInvitationByToken } from "@/lib/mocks/invitations";
import { AcceptView } from "@/features/invitation/accept-view";
import { Button } from "@/components/ui/button";
import Link from "next/link";

/**
 * 초대 확인/수락 페이지 (Server Component).
 * JWT 불필요 — 토큰으로 초대 정보를 조회한다.
 * TODO(sejun, NX-invite): BE 연동 시 fetch로 교체.
 */
export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const invitation = getInvitationByToken(token);

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center bg-surface-base px-6 py-12">
      {/* 배경 블러 장식 — 온보딩 레이아웃과 동일 */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/3 top-[-140px] size-[500px] rounded-full bg-accent/10 blur-[180px]" />
        <div className="absolute bottom-[-100px] right-1/4 size-[400px] rounded-full bg-brand-glow/8 blur-[160px]" />
      </div>

      <div className="relative w-full max-w-[460px]">
        <div className="animate-step-in rounded-2xl border border-border-subtle/60 bg-surface-elevated/40 px-8 py-10 shadow-2xl shadow-black/20 backdrop-blur-xl">
          {invitation ? (
            <AcceptView invitation={invitation} />
          ) : (
            <InvalidInviteView />
          )}
        </div>

        <p className="mt-6 text-center text-xs text-fg-tertiary">
          Nexus — 팀의 맥락을 잃지 않는 단 하나의 홈
        </p>
      </div>
    </div>
  );
}

function InvalidInviteView() {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-surface-overlay">
        <span className="text-3xl" role="img" aria-label="오류">
          🔗
        </span>
      </div>
      <h1 className="mt-6 text-2xl font-bold text-fg-primary">
        유효하지 않은 초대입니다
      </h1>
      <p className="mt-3 max-w-xs text-sm leading-relaxed text-fg-secondary">
        이 초대 링크가 올바른지 확인해주세요. 문제가 계속되면 워크스페이스
        관리자에게 새 초대를 요청하세요.
      </p>
      <Link href="/login" className="mt-8 block w-full">
        <Button variant="outline" size="md" className="w-full">
          로그인 페이지로 이동
        </Button>
      </Link>
    </div>
  );
}
