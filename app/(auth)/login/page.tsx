import type { Metadata } from "next";
import Link from "next/link";

import { LoginForm } from "@/features/auth/login-form";

export const metadata: Metadata = {
  title: "로그인 — Nexus",
  description: "Nexus 워크스페이스에 로그인하세요.",
};

export default function LoginPage() {
  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-fg-primary">
          다시 오신 것을 환영합니다
        </h1>
        <p className="mt-1.5 text-sm text-fg-secondary">
          이메일과 비밀번호로 Nexus에 로그인하세요.
        </p>
      </header>

      <LoginForm />

      <p className="mt-6 text-sm text-fg-secondary">
        아직 계정이 없으신가요?{" "}
        <Link
          href="/signup"
          className="font-medium text-accent hover:text-accent-hover transition-colors"
        >
          회원가입하기
        </Link>
      </p>
    </div>
  );
}
