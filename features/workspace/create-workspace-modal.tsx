"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/ui/field-error";
import { createWorkspaceApi } from "@/lib/api/workspace";
import { getAccessToken } from "@/lib/auth/tokens";

import { useWorkspace } from "./workspace-provider";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export function CreateWorkspaceModal({ isOpen, onClose }: Props) {
  const router = useRouter();
  const { addWorkspace } = useWorkspace();

  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleClose() {
    setName("");
    setError("");
    onClose();
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("워크스페이스 이름을 입력하세요.");
      return;
    }
    const token = getAccessToken() ?? "";
    setIsSubmitting(true);
    setError("");
    try {
      const workspace = await createWorkspaceApi(token, trimmed);
      addWorkspace(workspace);
      handleClose();
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "생성에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="새 워크스페이스">
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div className="space-y-1">
          <Label htmlFor="new-workspace-name">이름</Label>
          <Input
            id="new-workspace-name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") handleClose();
            }}
            placeholder="예: Aether Labs"
            hasError={Boolean(error)}
            autoFocus
          />
          <FieldError message={error} />
        </div>

        {name.trim() ? (
          <div className="flex items-center gap-3 rounded-xl border border-border-subtle bg-surface-base p-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 text-lg font-bold text-accent">
              {name.trim()[0]?.toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-fg-primary">{name.trim()}</p>
              <p className="text-xs text-fg-tertiary">새 워크스페이스</p>
            </div>
          </div>
        ) : null}

        <Button
          type="submit"
          variant="primary"
          size="md"
          className="w-full"
          isLoading={isSubmitting}
          disabled={isSubmitting}
        >
          {isSubmitting ? "생성 중…" : "만들기"}
        </Button>
      </form>
    </Modal>
  );
}
