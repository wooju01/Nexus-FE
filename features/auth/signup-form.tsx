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
import { setTokens } from "@/lib/auth/tokens";

import type { SignupInput, ValidationErrors } from "./validators";
import { hasErrors, validateSignup } from "./validators";

type FieldValue = string | boolean;

export function SignupForm() {
  const router = useRouter();
  const [values, setValues] = useState<SignupInput>({
    name: "",
    email: "",
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
      const tokens = await signupApi(values.name.trim(), values.email, values.password);
      setTokens(tokens.accessToken, tokens.refreshToken);
      router.push("/dashboard");
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : "회원가입에 실패했습니다."
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
    </form>
  );
}
