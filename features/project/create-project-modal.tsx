"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAccessToken } from "@/lib/auth/tokens";
import { createProjectApi, type Project } from "@/lib/api/project";

type CreateProjectModalProps = {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  onCreated: (project: Project) => void;
};

export function CreateProjectModal({
  isOpen,
  onClose,
  workspaceId,
  onCreated,
}: CreateProjectModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("프로젝트 이름을 입력하세요.");
      return;
    }
    const token = getAccessToken();
    if (!token) return;
    setIsSaving(true);
    setError("");
    try {
      const project = await createProjectApi(token, workspaceId, {
        name: name.trim(),
        description: description.trim() || undefined,
      });
      onCreated(project);
      setName("");
      setDescription("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "생성 실패");
    } finally {
      setIsSaving(false);
    }
  }

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="새 프로젝트"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-md rounded-2xl border border-border-subtle bg-surface-base p-6 shadow-2xl">
        <h2 className="mb-5 text-base font-semibold text-fg-primary">
          새 프로젝트
        </h2>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="project-name">프로젝트 이름 *</Label>
            <Input
              id="project-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError("");
              }}
              placeholder="예: Q3 런칭, 디자인 시스템 v2"
              hasError={Boolean(error)}
              autoFocus
            />
            <FieldError message={error} />
          </div>

          <div className="space-y-1">
            <Label htmlFor="project-desc">설명 (선택)</Label>
            <Input
              id="project-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="프로젝트 목표나 범위를 간략히 입력하세요"
            />
          </div>

          <p className="text-xs text-fg-tertiary">
            프로젝트를 생성하면 동명의 채널이 자동으로 만들어집니다.
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={onClose}
              disabled={isSaving}
            >
              취소
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSaving}
            >
              만들기
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
