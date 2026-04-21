/**
 * 클라이언트 측 폼 검증 유틸.
 *
 * 임시 구현: 외부 스키마 라이브러리(zod) 도입 전 최소한의 규칙을 직접 구현.
 * BE 계약 확정 및 react-hook-form+zod 도입 시 zod 스키마로 교체 예정.
 *
 * 규칙 메모:
 * - Email: RFC 5322 대신 실용적인 정규식 사용 (`@`와 점, 기본 문자 허용)
 * - Password: 최소 8자 + 영문·숫자 조합. 특수문자·대소문자 강제는 후속 과제.
 * - Name: 1~32자. 공백 trim 후 평가.
 */

export type ValidationErrors<T extends Record<string, unknown>> = Partial<
  Record<keyof T, string>
>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

export type LoginInput = {
  email: string;
  password: string;
};

export type SignupInput = {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
  agreed: boolean;
};

export function validateLogin(input: LoginInput): ValidationErrors<LoginInput> {
  const errors: ValidationErrors<LoginInput> = {};

  if (!input.email.trim()) {
    errors.email = "이메일을 입력해주세요.";
  } else if (!EMAIL_REGEX.test(input.email)) {
    errors.email = "올바른 이메일 형식이 아닙니다.";
  }

  if (!input.password) {
    errors.password = "비밀번호를 입력해주세요.";
  }

  return errors;
}

export function validateSignup(
  input: SignupInput,
): ValidationErrors<SignupInput> {
  const errors: ValidationErrors<SignupInput> = {};

  const trimmedName = input.name.trim();
  if (!trimmedName) {
    errors.name = "이름을 입력해주세요.";
  } else if (trimmedName.length > 32) {
    errors.name = "이름은 32자 이하여야 합니다.";
  }

  if (!input.email.trim()) {
    errors.email = "이메일을 입력해주세요.";
  } else if (!EMAIL_REGEX.test(input.email)) {
    errors.email = "올바른 이메일 형식이 아닙니다.";
  }

  if (!input.password) {
    errors.password = "비밀번호를 입력해주세요.";
  } else if (!PASSWORD_REGEX.test(input.password)) {
    errors.password = "영문과 숫자를 포함해 8자 이상 입력해주세요.";
  }

  if (!input.passwordConfirm) {
    errors.passwordConfirm = "비밀번호 확인을 입력해주세요.";
  } else if (input.password !== input.passwordConfirm) {
    errors.passwordConfirm = "비밀번호가 일치하지 않습니다.";
  }

  if (!input.agreed) {
    errors.agreed = "약관에 동의해야 가입할 수 있습니다.";
  }

  return errors;
}

export function hasErrors<T extends Record<string, unknown>>(
  errors: ValidationErrors<T>,
): boolean {
  return Object.values(errors).some((v) => Boolean(v));
}
