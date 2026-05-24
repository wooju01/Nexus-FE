"use client";

import { useCallback, useState } from "react";
import type { FormEvent } from "react";

import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { FieldError } from "@/components/ui/field-error";
import {
  SendIcon,
  CheckIcon,
  LinkIcon,
  CheckCircleIcon,
} from "@/components/icons";
import { cn } from "@/lib/utils/cn";
import { createInvitation } from "@/lib/api/invitations";
import { getAccessToken } from "@/lib/auth/tokens";
import {
  validateInvite,
  hasErrors,
} from "@/features/invitation/validators";

import type { ValidationErrors } from "@/features/auth/validators";
import type { InviteInput } from "@/features/invitation/validators";
import type { WorkspaceRole, Invitation } from "@/types/invitation";

const ROLE_OPTIONS = [
  {
    value: "MEMBER",
    label: "Member",
    description: "채널과 태스크에 참여할 수 있습니다",
  },
  {
    value: "ADMIN",
    label: "Admin",
    description: "멤버 관리와 설정을 변경할 수 있습니다",
  },
] as const;

type InviteModalProps = {
  isOpen: boolean;
  onClose: () => void;
  /** BE 가 식별하는 cuid 형태의 워크스페이스 id */
  workspaceId: string;
};

type InvitedEntry = {
  email: string;
  role: WorkspaceRole;
  /** BE 응답으로 받은 일회용 초대 토큰. 링크 복사·재공유 용도. */
  token: string;
};

/**
 * 팀원 초대 모달.
 *
 * 흐름:
 *   1. 이메일 + 역할 입력 → POST /workspaces/:id/invitations
 *   2. 응답으로 받은 token 으로 `${origin}/invite/{token}` 링크 생성
 *   3. 마지막 초대 링크는 상단 "초대 링크" 박스에 노출 → 복사 가능
 *      (Nodemailer 도입 후엔 메일 자동 발송도 BE 에서 처리되지만, 메일 실패 대비로
 *       링크는 항상 응답으로 같이 받아 복사 fallback 을 보장.)
 *   4. 모달 세션 동안 초대한 사람 목록을 invitedList 로 보여줌.
 */
export function InviteModal({
  isOpen,
  onClose,
  workspaceId,
}: InviteModalProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<WorkspaceRole>("MEMBER");
  const [errors, setErrors] = useState<ValidationErrors<InviteInput>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [invitedList, setInvitedList] = useState<ReadonlyArray<InvitedEntry>>(
    [],
  );
  const [copied, setCopied] = useState(false);

  /**
   * 가장 최근에 발급된 초대 링크.
   * 첫 초대 전엔 placeholder, 발급 후엔 실제 토큰 링크.
   */
  const lastInvited = invitedList[invitedList.length - 1];
  const inviteLink = lastInvited
    ? buildInviteLink(lastInvited.token)
    : "초대를 보내면 링크가 생성됩니다";

  function handleEmailChange(value: string) {
    setEmail(value);
    if (errors.email) {
      setErrors((prev) => ({ ...prev, email: undefined }));
    }
    if (serverError) setServerError(null);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const nextErrors = validateInvite({ email });
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    const accessToken = getAccessToken();
    if (!accessToken) {
      setServerError("로그인이 필요합니다.");
      return;
    }

    setIsSubmitting(true);
    setServerError(null);
    try {
      const invitation: Invitation = await createInvitation(accessToken, {
        workspaceId,
        email,
        role,
      });
      setInvitedList((prev) => [
        ...prev,
        { email, role, token: invitation.token },
      ]);
      setEmail("");
      setRole("MEMBER");
    } catch (err) {
      setServerError(
        err instanceof Error
          ? err.message
          : "초대 발송 중 오류가 발생했습니다.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleCopy = useCallback(async () => {
    if (!lastInvited) return;
    try {
      await navigator.clipboard.writeText(buildInviteLink(lastInvited.token));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 클립보드 API 미지원 환경 대비 — 조용히 무시.
    }
  }, [lastInvited]);

  function handleClose() {
    setEmail("");
    setRole("MEMBER");
    setErrors({});
    setServerError(null);
    setInvitedList([]);
    setCopied(false);
    onClose();
  }

  const canCopy = Boolean(lastInvited);

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="팀원 초대">
      {/* 이메일로 초대 */}
      <form onSubmit={handleSubmit}>
        <Label htmlFor="invite-email">이메일 주소</Label>
        <Input
          id="invite-email"
          type="email"
          placeholder="teammate@example.com"
          value={email}
          onChange={(e) => handleEmailChange(e.target.value)}
          hasError={Boolean(errors.email)}
          disabled={isSubmitting}
        />
        <FieldError message={errors.email} />

        <div className="mt-3">
          <Label htmlFor="invite-role">역할</Label>
          <Select
            id="invite-role"
            value={role}
            onChange={(v) => setRole(v as WorkspaceRole)}
            disabled={isSubmitting}
            options={ROLE_OPTIONS}
          />
        </div>

        {serverError ? (
          <p role="alert" className="mt-3 text-sm text-red-500">
            {serverError}
          </p>
        ) : null}

        <Button
          type="submit"
          variant="primary"
          size="sm"
          isLoading={isSubmitting}
          className="mt-4 w-full"
        >
          <SendIcon width={16} height={16} />
          초대 보내기
        </Button>
      </form>

      {/* 구분선 */}
      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-border-subtle" />
        <span className="text-xs text-fg-tertiary">또는</span>
        <div className="h-px flex-1 bg-border-subtle" />
      </div>

      {/* 초대 링크 복사 (마지막 토큰 기반) */}
      <div>
        <div className="mb-2 flex items-center gap-1.5 text-sm font-medium text-fg-secondary">
          <LinkIcon width={16} height={16} />
          초대 링크
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-surface-base p-2">
          <span
            className={cn(
              "min-w-0 flex-1 truncate px-2 font-mono text-xs",
              canCopy ? "text-fg-secondary" : "text-fg-tertiary",
            )}
          >
            {inviteLink}
          </span>
          <Button
            variant={copied ? "primary" : "secondary"}
            size="sm"
            onClick={handleCopy}
            disabled={!canCopy}
            className={cn(
              "shrink-0 min-w-[60px]",
              copied ? "bg-status-done hover:bg-status-done" : "",
            )}
          >
            {copied ? (
              <span className="flex items-center gap-1">
                <CheckIcon width={14} height={14} />
                완료
              </span>
            ) : (
              "복사"
            )}
          </Button>
        </div>
      </div>

      {/* 이번 세션에서 초대한 목록 */}
      {invitedList.length > 0 ? (
        <div className="mt-5 rounded-lg border border-border-subtle bg-surface-base p-3">
          <p className="mb-2 text-xs font-medium text-fg-tertiary">
            초대 완료
          </p>
          <ul className="space-y-1.5">
            {invitedList.map((entry) => (
              <li
                key={entry.token}
                className="flex items-center gap-2 text-sm text-fg-secondary"
              >
                <CheckCircleIcon
                  width={14}
                  height={14}
                  className="flex-shrink-0 text-status-done"
                />
                <span className="min-w-0 flex-1 truncate">{entry.email}</span>
                <span className="rounded-md bg-surface-overlay px-2 py-0.5 text-[10px] text-fg-tertiary">
                  {entry.role}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </Modal>
  );
}

/**
 * 초대 토큰으로 절대 URL 생성.
 * SSR 환경(window 미존재)에서도 안전하게 동작하도록 origin 분기.
 */
function buildInviteLink(token: string): string {
  const origin =
    typeof window !== "undefined" ? window.location.origin : "https://nexus.app";
  return `${origin}/invite/${token}`;
}
