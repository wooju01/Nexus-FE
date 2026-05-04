import type { ValidationErrors } from "@/features/auth/validators";
import { hasErrors } from "@/features/auth/validators";

export { hasErrors };

/* ─── 프로필 ─── */

export type ProfileInput = {
  displayName: string;
  role: string;
};

export function validateProfile(
  input: ProfileInput,
): ValidationErrors<ProfileInput> {
  const errors: ValidationErrors<ProfileInput> = {};

  const trimmedName = input.displayName.trim();
  if (!trimmedName) {
    errors.displayName = "표시이름을 입력해주세요.";
  } else if (trimmedName.length > 32) {
    errors.displayName = "표시이름은 32자 이하여야 합니다.";
  }

  if (!input.role.trim()) {
    errors.role = "역할을 선택해주세요.";
  }

  return errors;
}

/* ─── 워크스페이스 ─── */

export type WorkspaceInput = {
  workspaceName: string;
};

export function validateWorkspace(
  input: WorkspaceInput,
): ValidationErrors<WorkspaceInput> {
  const errors: ValidationErrors<WorkspaceInput> = {};

  const trimmedName = input.workspaceName.trim();
  if (!trimmedName) {
    errors.workspaceName = "워크스페이스 이름을 입력해주세요.";
  } else if (trimmedName.length > 40) {
    errors.workspaceName = "워크스페이스 이름은 40자 이하여야 합니다.";
  }

  return errors;
}
