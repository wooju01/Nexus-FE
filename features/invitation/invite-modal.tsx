"use client";

import { useCallback, useState } from "react";
import type { FormEvent } from "react";

import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { FieldError } from "@/components/ui/field-error";
import { SendIcon, CheckIcon, LinkIcon, CheckCircleIcon } from "@/components/icons";
import { cn } from "@/lib/utils/cn";
import { createInvitation } from "@/lib/api/invitations";
import { validateInvite, hasErrors } from "@/features/invitation/validators";

import type { ValidationErrors } from "@/features/auth/validators";
import type { InviteInput } from "@/features/invitation/validators";
import type { WorkspaceRole } from "@/types/invitation";

const ROLE_OPTIONS = [
  { value: "MEMBER", label: "Member", description: "채널과 태스크에 참여할 수 있습니다" },
  { value: "ADMIN", label: "Admin", description: "멤버 관리와 설정을 변경할 수 있습니다" },
] as const;

type InviteModalProps = {
  isOpen: boolean;
  onClose: () => void;
  workspaceSlug: string;
};

type InvitedEntry = {
  email: string;
  role: WorkspaceRole;
};

export function InviteModal({ isOpen, onClose, workspaceSlug }: InviteModalProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<WorkspaceRole>("MEMBER");
  const [errors, setErrors] = useState<ValidationErrors<InviteInput>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [invitedList, setInvitedList] = useState<ReadonlyArray<InvitedEntry>>([]);
  const [copied, setCopied] = useState(false);

  const inviteLink = `https://nexus.app/${workspaceSlug}/invite`;

  function handleEmailChange(value: string) {
    setEmail(value);
    if (errors.email) {
      setErrors((prev) => ({ ...prev, email: undefined }));
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const nextErrors = validateInvite({ email });
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    setIsSubmitting(true);
    try {
      // TODO(sejun, NX-invite): workspaceId를 실제 값으로 교체
      await createInvitation({ workspaceId: "ws-1", email, role });
      setInvitedList((prev) => [...prev, { email, role }]);
      setEmail("");
      setRole("MEMBER");
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 클립보드 API 미지원 환경 대비
    }
  }, [inviteLink]);

  function handleClose() {
    setEmail("");
    setRole("MEMBER");
    setErrors({});
    setInvitedList([]);
    onClose();
  }

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

      {/* 초대 링크 복사 */}
      <div>
        <div className="mb-2 flex items-center gap-1.5 text-sm font-medium text-fg-secondary">
          <LinkIcon width={16} height={16} />
          초대 링크
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-surface-base p-2">
          <span className="min-w-0 flex-1 truncate px-2 font-mono text-xs text-fg-secondary">
            {inviteLink}
          </span>
          <Button
            variant={copied ? "primary" : "secondary"}
            size="sm"
            onClick={handleCopy}
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
          <p className="mb-2 text-xs font-medium text-fg-tertiary">초대 완료</p>
          <ul className="space-y-1.5">
            {invitedList.map((entry) => (
              <li
                key={entry.email}
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
