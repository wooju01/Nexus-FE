import type { Metadata } from "next";

import { CompleteView } from "@/features/onboarding/complete-view";

export const metadata: Metadata = {
  title: "설정 완료 — Nexus",
  description: "워크스페이스가 준비되었습니다.",
};

export default function CompletePage() {
  return <CompleteView />;
}
