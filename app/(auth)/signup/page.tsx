import type { Metadata } from "next";
import Link from "next/link";

import { SignupForm } from "@/features/auth/signup-form";

export const metadata: Metadata = {
  title: "회원가입 — Nexus",
  description: "Nexus 계정을 만들고 팀 워크스페이스를 시작하세요.",
};

export default function SignupPage() {
  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-fg-primary">
          Nexus 시작하기
        </h1>
        <p className="mt-1.5 text-sm text-fg-secondary">
          이메일로 워크스페이스를 2분 안에 만들 수 있어요.
        </p>
      </header>

      <SignupForm />

      <p className="mt-6 text-sm text-fg-secondary">
        이미 계정이 있으신가요?{" "}
        <Link
          href="/login"
          className="font-medium text-accent hover:text-accent-hover transition-colors"
        >
          로그인하기
        </Link>
      </p>
    </div>
  );
}
