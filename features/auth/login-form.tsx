"use client";

import type { FormEvent } from "react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";

import type { LoginInput, ValidationErrors } from "./validators";
import { hasErrors, validateLogin } from "./validators";

/**
 * 로그인 폼.
 *
 * 임시 구현: react-hook-form + zod 도입 전까지 useState로 관리.
 * 마이그레이션 시
 *   - const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) })
 * 로 교체하고, Input/Checkbox에 `{...register("field")}`만 스프레드하면 된다.
 *
 * 현재 submit은 BE 미결 상태이므로 콘솔 로그만 찍는다.
 */
export function LoginForm() {
  const [values, setValues] = useState<LoginInput>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<ValidationErrors<LoginInput>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (key: keyof LoginInput, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    // 타이핑 시 해당 필드 에러만 소거해 즉각적 피드백을 준다.
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateLogin(values);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) {
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO(NX-auth): BE /auth/login 엔드포인트 계약 확정 후 fetch 연동
      console.log("[auth] login submit", {
        email: values.email,
        passwordLength: values.password.length,
      });
      // 실제 연동 전까지는 제출 피드백만 주기 위해 짧은 지연.
      await new Promise((resolve) => setTimeout(resolve, 400));
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
