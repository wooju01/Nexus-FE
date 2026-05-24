import type { Metadata } from "next";

import { ProfileSettings } from "@/features/profile/profile-settings";

export const metadata: Metadata = {
  title: "프로필 설정 — Nexus",
};

export default function ProfileSettingsPage() {
  return <ProfileSettings />;
}
