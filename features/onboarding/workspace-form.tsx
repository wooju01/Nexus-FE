"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { ValidationErrors } from "@/features/auth/validators";

import { useOnboarding } from "./onboarding-provider";
import type { WorkspaceInput } from "./validators";
import { hasErrors, validateWorkspace } from "./validators";
import { createWorkspaceApi } from "@/lib/api/workspace";
import { getAccessToken } from "@/lib/auth/tokens";

export function WorkspaceForm() {
  const router = useRouter();
  const { state, updateWorkspace } = useOnboarding();

  const [errors, setErrors] = useState<ValidationErrors<WorkspaceInput>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleNameChange(name: string) {
    updateWorkspace({ workspaceName: name });
    if (errors.workspaceName) {
      setErrors((prev) => ({ ...prev, workspaceName: undefined }));
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const input: WorkspaceInput = {
      workspaceName: state.workspace.workspaceName,
    };
    const nextErrors = validateWorkspace(input);
    setErrors(nextErrors);

    if (hasErrors(nextErrors)) return;

    setIsSubmitting(true);
    try {
      const token = getAccessToken() ?? "";
      await createWorkspaceApi(token, state.workspace.workspaceName.trim());

      router.push("/complete");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8">
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
