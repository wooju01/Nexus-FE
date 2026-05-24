import type { Metadata } from "next";

import { ProfileForm } from "@/features/onboarding/profile-form";
import { StepIndicator } from "@/features/onboarding/step-indicator";

export const metadata: Metadata = {
  title: "프로필 설정 — Nexus",
  description: "Nexus에서 사용할 프로필을 설정하세요.",
};

export default function ProfilePage() {
  return (
    <div>
      <header className="mb-10 flex flex-col items-center text-center">
        <StepIndicator currentStep={1} totalSteps={2} />
        <h1 className="mt-8 text-2xl font-bold tracking-tight text-fg-primary">
          프로필을 설정하세요
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-fg-secondary">
          팀원들에게 보이는 이름과 역할을 알려주세요.
        </p>
      </header>

      <ProfileForm />
    </div>
  );
}
