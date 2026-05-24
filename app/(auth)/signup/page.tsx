import type { Metadata } from "next";
import Link from "next/link";

import { SignupForm } from "@/features/auth/signup-form";
import { fetchInvitationByToken } from "@/lib/api/invitations";

export const metadata: Metadata = {
  title: "회원가입 — Nexus",
  description: "Nexus 계정을 만들고 팀 워크스페이스를 시작하세요.",
};

/**
 * 회원가입 페이지.
 *
 * `?invite=<token>` 쿼리가 있으면:
 *   - 토큰으로 초대 정보를 미리 조회해서 워크스페이스 이름을 헤더에 표시
 *   - 초대 이메일이 있으면 가입 폼에 prefill (단, 사용자가 수정 가능)
 *   - 가입 성공 직후 SignupForm 이 자동으로 acceptInvitation 호출 → /dashboard 이동
 *   - 토큰이 무효/만료면 안내만 띄우고 일반 가입 흐름으로 진행
 */
export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ invite?: string }>;
}) {
  const { invite } = await searchParams;
  const invitation = invite
    ? await fetchInvitationByToken(invite).catch(() => null)
    : null;

  const isUsableInvite =
    invitation !== null && invitation?.status === "pending";

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-fg-primary">
          {isUsableInvite ? `${invitation.workspaceName}에 합류하기` : "Nexus 시작하기"}
        </h1>
        <p className="mt-1.5 text-sm text-fg-secondary">
          {isUsableInvite
            ? `${invitation.creatorName}님이 ${invitation.role === "ADMIN" ? "관리자" : "멤버"} 역할로 초대했습니다. 가입 후 자동으로 합류됩니다.`
            : "이메일로 워크스페이스를 2분 안에 만들 수 있어요."}
        </p>
      </header>

      {invite && !isUsableInvite ? (
        <div
          role="status"
          className="mb-6 rounded-lg border border-border-subtle bg-surface-base p-3 text-xs text-fg-tertiary"
        >
          {invitation === null
            ? "초대 링크가 더 이상 유효하지 않습니다. 일반 가입은 그대로 진행할 수 있어요."
            : invitation.status === "expired"
              ? "초대 링크가 만료됐습니다. 워크스페이스 관리자에게 새 초대를 요청해주세요."
              : "이 초대는 이미 사용됐습니다."}
        </div>
      ) : null}

      <SignupForm
        inviteToken={isUsableInvite ? invite : undefined}
        prefillEmail={isUsableInvite ? invitation.email ?? undefined : undefined}
      />

      <p className="mt-6 text-sm text-fg-secondary">
        이미 계정이 있으신가요?{" "}
        <Link
          href={isUsableInvite ? `/login?invite=${invite}` : "/login"}
          className="font-medium text-accent hover:text-accent-hover transition-colors"
        >
          로그인하기
        </Link>
      </p>
    </div>
  );
}
