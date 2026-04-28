"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils/cn";

import type { ValidationErrors } from "@/features/auth/validators";

import { useOnboarding } from "./onboarding-provider";
import type { WorkspaceInput } from "./validators";
import { hasErrors, toSlug, validateWorkspace } from "./validators";
import { createWorkspaceApi } from "@/lib/api/workspace";

/**
 * 온보딩 스텝 2: 워크스페이스 생성 폼.
 * 워크스페이스 이름 입력 시 URL 슬러그가 자동 생성되며, 수동 수정도 가능.
 */
export function WorkspaceForm() {
  const router = useRouter();
  const { state, updateWorkspace } = useOnboarding();

  const [slugTouched, setSlugTouched] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors<WorkspaceInput>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleNameChange(name: string) {
    updateWorkspace({
      workspaceName: name,
      workspaceSlug: slugTouched ? state.workspace.workspaceSlug : toSlug(name),
    });
    if (errors.workspaceName) {
      setErrors((prev) => ({ ...prev, workspaceName: undefined }));
    }
  }

  function handleSlugChange(slug: string) {
    setSlugTouched(true);
    updateWorkspace({ workspaceSlug: slug });
    if (errors.workspaceSlug) {
      setErrors((prev) => ({ ...prev, workspaceSlug: undefined }));
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const input: WorkspaceInput = {
      workspaceName: state.workspace.workspaceName,
      workspaceSlug: state.workspace.workspaceSlug,
    };
    const nextErrors = validateWorkspace(input);
    setErrors(nextErrors);

    if (hasErrors(nextErrors)) {
      return;
    }

    setIsSubmitting(true);
    try {
      await createWorkspaceApi(
        state.workspace.workspaceName.trim(),
        // description은 온보딩에서 입력받지 않으므로 생략
      );
      router.push("/complete");
    } catch (err) {
      // 에러 처리 추가 필요
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  const slug = state.workspace.workspaceSlug;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8">
      {/* 워크스페이스 아이콘 프리뷰 */}
      <div className="flex justify-center">
        <div className="flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-accent/20 to-brand-glow/20 border border-border-subtle">
          <span className="text-3xl font-bold text-accent">
            {state.workspace.workspaceName.trim()[0]?.toUpperCase() ?? "W"}
          </span>
        </div>
      </div>

      <div>
        <Label htmlFor="onboarding-workspace-name">워크스페이스 이름</Label>
        <Input
          id="onboarding-workspace-name"
          type="text"
          placeholder="예: Aether Labs"
          value={state.workspace.workspaceName}
          onChange={(e) => handleNameChange(e.target.value)}
          hasError={Boolean(errors.workspaceName)}
        />
        <FieldError message={errors.workspaceName} />
      </div>

      <div>
        <Label htmlFor="onboarding-workspace-slug">URL</Label>
        <div className="flex items-center gap-0">
          <span className="flex h-10 items-center rounded-l-lg border border-r-0 border-border-default bg-surface-subtle px-3 text-sm text-fg-tertiary">
            nexus.app/
          </span>
          <Input
            id="onboarding-workspace-slug"
            type="text"
            placeholder="aether-labs"
            value={state.workspace.workspaceSlug}
            onChange={(e) => handleSlugChange(e.target.value)}
            hasError={Boolean(errors.workspaceSlug)}
            className="rounded-l-none"
          />
        </div>
        {/* 실시간 URL 프리뷰 */}
        {slug ? (
          <p className="mt-2 text-xs text-fg-tertiary">
            접속 주소:{" "}
            <span
              className={cn(
                "font-mono transition-colors",
                errors.workspaceSlug ? "text-priority-p1" : "text-accent",
              )}
            >
              nexus.app/{slug}
            </span>
          </p>
        ) : null}
        <FieldError message={errors.workspaceSlug} />
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        isLoading={isSubmitting}
      >
        {isSubmitting ? "생성 중..." : "워크스페이스 만들기"}
      </Button>
    </form>
  );
}
