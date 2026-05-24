import type { Metadata } from "next";

import { BackButton } from "@/features/onboarding/back-button";
import { StepIndicator } from "@/features/onboarding/step-indicator";
import { WorkspaceForm } from "@/features/onboarding/workspace-form";

export const metadata: Metadata = {
  title: "워크스페이스 생성 — Nexus",
  description: "팀과 함께 사용할 워크스페이스를 만드세요.",
};

export default function WorkspacePage() {
  return (
    <div className="relative">
      <BackButton href="/profile" />

      <header className="mb-10 flex flex-col items-center text-center">
        <StepIndicator currentStep={2} totalSteps={2} />
        <h1 className="mt-8 text-2xl font-bold tracking-tight text-fg-primary">
          워크스페이스를 만드세요
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-fg-secondary">
          팀의 모든 대화와 작업이 이곳에 모입니다.
        </p>
      </header>

      <WorkspaceForm />
    </div>
  );
}
