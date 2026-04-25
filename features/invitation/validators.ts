/**
 * 초대 폼 검증.
 * features/auth/validators.ts의 패턴을 따른다.
 */

import type { ValidationErrors } from "@/features/auth/validators";
import { hasErrors } from "@/features/auth/validators";

export { hasErrors };

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type InviteInput = {
  email: string;
};

export function validateInvite(
  input: InviteInput,
): ValidationErrors<InviteInput> {
  const errors: ValidationErrors<InviteInput> = {};

  if (!input.email.trim()) {
    errors.email = "이메일을 입력해주세요.";
  } else if (!EMAIL_REGEX.test(input.email)) {
    errors.email = "올바른 이메일 형식이 아닙니다.";
  }

  return errors;
}
