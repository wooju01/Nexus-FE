/**
 * 온보딩 폼 검증 로직.
 * features/auth/validators.ts 와 동일한 패턴(ValidationErrors + hasErrors) 사용.
 */

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
  workspaceSlug: string;
};

const SLUG_REGEX = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;

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

  const slug = input.workspaceSlug.trim();
  if (!slug) {
    errors.workspaceSlug = "URL 슬러그를 입력해주세요.";
  } else if (slug.length < 2) {
    errors.workspaceSlug = "슬러그는 2자 이상이어야 합니다.";
  } else if (slug.length > 40) {
    errors.workspaceSlug = "슬러그는 40자 이하여야 합니다.";
  } else if (!SLUG_REGEX.test(slug)) {
    errors.workspaceSlug =
      "영문 소문자, 숫자, 하이픈만 사용 가능합니다. 시작과 끝은 하이픈 불가.";
  }

  return errors;
}

/* ─── 유틸 ─── */

/** 워크스페이스 이름을 URL-safe 슬러그로 변환. */
export function toSlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
