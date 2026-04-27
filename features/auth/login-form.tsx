"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { loginApi } from "@/lib/api/auth";
import { setTokens } from "@/lib/auth/tokens";

import type { LoginInput, ValidationErrors } from "./validators";
import { hasErrors, validateLogin } from "./validators";

export function LoginForm() {
  const router = useRouter();
  const [values, setValues] = useState<LoginInput>({ email: "", password: "" });
  const [errors, setErrors] = useState<ValidationErrors<LoginInput>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const handleChange = (key: keyof LoginInput, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateLogin(values);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    setIsSubmitting(true);
    setServerError(null);
    try {
      const tokens = await loginApi(values.email, values.password);
      setTokens(tokens.accessToken, tokens.refreshToken);
      router.push("/dashboard");
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : "로그인에 실패했습니다."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div>
        <Label htmlFor="login-email">이메일</Label>
        <Input
          id="login-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@team.com"
          value={values.email}
          onChange={(e) => handleChange("email", e.target.value)}
          hasError={Boolean(errors.email)}
          aria-describedby={errors.email ? "login-email-error" : undefined}
        />
        <FieldError message={errors.email} />
      </div>

      <div>
        <Label htmlFor="login-password">비밀번호</Label>
        <PasswordInput
          id="login-password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={values.password}
          onChange={(e) => handleChange("password", e.target.value)}
          hasError={Boolean(errors.password)}
          aria-describedby={
            errors.password ? "login-password-error" : undefined
          }
        />
        <FieldError message={errors.password} />
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
        {isSubmitting ? "로그인 중..." : "로그인"}
      </Button>
    </form>
  );
}
