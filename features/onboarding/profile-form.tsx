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

import { AvatarUpload } from "./avatar-upload";
import { useOnboarding } from "./onboarding-provider";
import type { ProfileInput } from "./validators";
import { hasErrors, validateProfile } from "./validators";

const ROLE_PRESETS = [
  { value: "개발자", icon: "M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" },
  { value: "디자이너", icon: "M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42" },
  { value: "PM", icon: "M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" },
  { value: "마케터", icon: "M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 1 1 0-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 0 1-1.44-4.282m3.102.069a18.03 18.03 0 0 1-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 0 1 8.835 2.535M10.34 6.66a23.847 23.847 0 0 0 8.835-2.535m0 0A23.74 23.74 0 0 0 18.795 3m.38 1.125a23.91 23.91 0 0 1 1.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 0 0 1.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 0 1 0 3.46" },
] as const;

/**
 * 온보딩 스텝 1: 프로필 설정 폼.
 * 표시이름(필수) + 역할(필수, 아이콘 카드형) + 아바타(선택).
 */
export function ProfileForm() {
  const router = useRouter();
  const { state, updateProfile } = useOnboarding();

  const [errors, setErrors] = useState<ValidationErrors<ProfileInput>>({});
  const [isCustomRole, setIsCustomRole] = useState(
    state.profile.role !== "" &&
      !ROLE_PRESETS.some((r) => r.value === state.profile.role),
  );
  const [customRole, setCustomRole] = useState(
    isCustomRole ? state.profile.role : "",
  );

  function handleSelectRole(role: string) {
    setIsCustomRole(false);
    updateProfile({ role });
    if (errors.role) {
      setErrors((prev) => ({ ...prev, role: undefined }));
    }
  }

  function handleCustomRoleClick() {
    setIsCustomRole(true);
    updateProfile({ role: customRole });
    if (errors.role) {
      setErrors((prev) => ({ ...prev, role: undefined }));
    }
  }

  function handleCustomRoleChange(value: string) {
    setCustomRole(value);
    updateProfile({ role: value });
    if (errors.role) {
      setErrors((prev) => ({ ...prev, role: undefined }));
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const input: ProfileInput = {
      displayName: state.profile.displayName,
      role: state.profile.role,
    };
    const nextErrors = validateProfile(input);
    setErrors(nextErrors);

    if (hasErrors(nextErrors)) {
      return;
    }

    router.push("/workspace");
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8">
      <AvatarUpload
        displayName={state.profile.displayName}
        onFileSelect={(file) => updateProfile({ avatarFile: file })}
      />

      <div>
        <Label htmlFor="onboarding-display-name">표시이름</Label>
        <Input
          id="onboarding-display-name"
          type="text"
          autoComplete="name"
          placeholder="팀원에게 보이는 이름"
          value={state.profile.displayName}
          onChange={(e) => {
            updateProfile({ displayName: e.target.value });
            if (errors.displayName) {
              setErrors((prev) => ({ ...prev, displayName: undefined }));
            }
          }}
          hasError={Boolean(errors.displayName)}
        />
        <FieldError message={errors.displayName} />
      </div>

      <div>
        <Label>역할</Label>
        <div className="grid grid-cols-2 gap-2">
          {ROLE_PRESETS.map((role) => {
            const isSelected = state.profile.role === role.value && !isCustomRole;
            return (
              <button
                key={role.value}
                type="button"
                onClick={() => handleSelectRole(role.value)}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl px-3.5 py-3 text-sm font-medium transition-all",
                  "border",
                  isSelected
                    ? "border-accent bg-accent-subtle text-accent shadow-[0_0_0_1px_rgba(79,140,255,0.3)]"
                    : "border-border-default text-fg-secondary hover:border-border-strong hover:bg-surface-elevated hover:text-fg-primary",
                )}
              >
                <svg
                  className={cn(
                    "size-4 shrink-0",
                    isSelected ? "text-accent" : "text-fg-tertiary",
                  )}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d={role.icon}
                  />
                </svg>
                {role.value}
              </button>
            );
          })}
        </div>

        {/* 기타 역할 */}
        <button
          type="button"
          onClick={handleCustomRoleClick}
          className={cn(
            "mt-2 w-full rounded-xl px-3.5 py-3 text-sm font-medium transition-all",
            "border text-left",
            isCustomRole
              ? "border-accent bg-accent-subtle text-accent shadow-[0_0_0_1px_rgba(79,140,255,0.3)]"
              : "border-border-default text-fg-secondary hover:border-border-strong hover:bg-surface-elevated hover:text-fg-primary",
          )}
        >
          기타 (직접 입력)
        </button>

        {isCustomRole ? (
          <div className="mt-2">
            <Input
              type="text"
              placeholder="예: CTO, 데이터 분석가, QA 엔지니어"
              value={customRole}
              onChange={(e) => handleCustomRoleChange(e.target.value)}
              hasError={Boolean(errors.role)}
              autoFocus
            />
          </div>
        ) : null}

        <FieldError message={errors.role} />
      </div>

      <Button type="submit" variant="primary" size="lg" className="w-full">
        다음
      </Button>
    </form>
  );
}
