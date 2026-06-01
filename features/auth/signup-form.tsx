"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { signupApi } from "@/lib/api/auth";
import { acceptInvitation } from "@/lib/api/invitations";
import { setTokens } from "@/lib/auth/tokens";

import type { SignupInput, ValidationErrors } from "./validators";
import { hasErrors, validateSignup } from "./validators";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type FieldValue = string | boolean;

type SignupFormProps = {
  /** `?invite=<token>` 으로 들어온 경우 — 가입 직후 자동으로 수락 호출 */
  inviteToken?: string;
  /** 초대 이메일이 명시된 경우 prefill (사용자가 수정 가능) */
  prefillEmail?: string;
};

export function SignupForm({ inviteToken, prefillEmail }: SignupFormProps = {}) {
  const router = useRouter();
  const [values, setValues] = useState<SignupInput>({
    name: "",
    username: "",
    email: prefillEmail ?? "",
    password: "",
    passwordConfirm: "",
    agreed: false,
  });
  const [errors, setErrors] = useState<ValidationErrors<SignupInput>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const handleChange = (key: keyof SignupInput, value: FieldValue) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateSignup(values);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    setIsSubmitting(true);
    setServerError(null);
    try {
      const tokens = await signupApi(
        values.name.trim(),
        values.username,
        values.email,
        values.password,
      );
      setTokens(tokens.accessToken, tokens.refreshToken);

      // 초대 토큰이 있으면 가입 직후 자동 수락 → 워크스페이스로 직행.
      // 수락 실패해도 가입 자체는 끝났으니, 사용자에겐 메시지만 띄우고 로그인 페이지로 폴백.
      if (inviteToken) {
        try {
          await acceptInvitation(tokens.accessToken, inviteToken);
          router.push("/dashboard");
          return;
        } catch (err) {
          setServerError(
            err instanceof Error
              ? `가입은 완료됐지만 초대 수락에 실패했습니다: ${err.message}`
              : "가입은 완료됐지만 초대 수락에 실패했습니다.",
          );
          // 그래도 로그인된 상태이므로 dashboard 로 보낸다.
          router.push("/dashboard");
          return;
        }
      }

      router.push("/login");
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : "회원가입에 실패했습니다.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div>
        <Label htmlFor="signup-name">이름</Label>
        <Input
          id="signup-name"
          type="text"
          autoComplete="name"
          placeholder="예: 박지우"
          value={values.name}
          onChange={(e) => handleChange("name", e.target.value)}
          hasError={Boolean(errors.name)}
        />
        <FieldError message={errors.name} />
      </div>

      <div>
        <Label htmlFor="signup-username">사용자 태그</Label>
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-fg-tertiary">
            #
          </span>
          <Input
            id="signup-username"
            type="text"
            autoComplete="username"
            placeholder="wooju._00"
            value={values.username}
            onChange={(e) => handleChange("username", e.target.value.toLowerCase())}
            hasError={Boolean(errors.username)}
            className="pl-7"
          />
        </div>
        <p className="mt-1 text-xs text-fg-tertiary">소문자·숫자·점·언더스코어, 3~20자</p>
        <FieldError message={errors.username} />
      </div>

      <div>
        <Label htmlFor="signup-email">이메일</Label>
        <Input
          id="signup-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@team.com"
          value={values.email}
          onChange={(e) => handleChange("email", e.target.value)}
          hasError={Boolean(errors.email)}
        />
        <FieldError message={errors.email} />
        {prefillEmail ? (
          <p className="mt-1 text-[11px] text-fg-tertiary">
            초대받은 이메일이 자동 입력됐습니다. 다른 이메일을 사용하면 초대가
            수락되지 않을 수 있어요.
          </p>
        ) : null}
      </div>

      <div>
        <Label htmlFor="signup-password">비밀번호</Label>
        <PasswordInput
          id="signup-password"
          autoComplete="new-password"
          placeholder="영문·숫자 포함 8자 이상"
          value={values.password}
          onChange={(e) => handleChange("password", e.target.value)}
          hasError={Boolean(errors.password)}
        />
        <FieldError message={errors.password} />
      </div>

      <div>
        <Label htmlFor="signup-password-confirm">비밀번호 확인</Label>
        <PasswordInput
          id="signup-password-confirm"
          autoComplete="new-password"
          placeholder="한 번 더 입력"
          value={values.passwordConfirm}
          onChange={(e) => handleChange("passwordConfirm", e.target.value)}
          hasError={Boolean(errors.passwordConfirm)}
        />
        <FieldError message={errors.passwordConfirm} />
      </div>

      <div className="pt-1">
        <Checkbox
          id="signup-agreed"
          checked={values.agreed}
          onChange={(e) => handleChange("agreed", e.target.checked)}
          hasError={Boolean(errors.agreed)}
          label={
            <span>
              <a href="#" className="text-accent hover:text-accent-hover">
                이용약관
              </a>
              과{" "}
              <a href="#" className="text-accent hover:text-accent-hover">
                개인정보 처리방침
              </a>
              에 동의합니다.
            </span>
          }
        />
        <FieldError message={errors.agreed} />
      </div>

      {serverError && (
        <p role="alert" className="text-sm text-red-500">
          {serverError}
        </p>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? "계정 생성 중..." : "계정 만들기"}
      </Button>

      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border-subtle" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-surface-base px-2 text-fg-tertiary">또는 소셜 계정으로 시작</span>
        </div>
      </div>

      <a
        href={`${API_URL}/auth/google`}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-border-subtle bg-surface-base px-4 py-2.5 text-sm font-medium text-fg-primary transition-colors hover:bg-surface-subtle"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
          <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" />
          <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
          <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" />
          <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
        </svg>
        Google로 시작하기
      </a>

      <a
        href={`${API_URL}/auth/kakao`}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-border-subtle bg-[#FEE500] px-4 py-2.5 text-sm font-medium text-[#191919] transition-opacity hover:opacity-90"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
          <path fill="#191919" d="M9 0C4.029 0 0 3.136 0 7c0 2.496 1.659 4.685 4.166 5.928L3.1 17.1c-.09.33.27.6.56.41l5.34-3.55c.665.07 1.337.04 2 0 4.971 0 9-3.134 9-7S13.971 0 9 0z" />
        </svg>
        카카오로 시작하기
      </a>
    </form>
  );
}
