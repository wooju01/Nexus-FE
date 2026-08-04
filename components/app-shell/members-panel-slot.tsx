"use client";

import { useAppShell } from "@/components/app-shell/app-shell-context";
import { MembersPanel } from "@/features/workspace/members-panel";

export function MembersPanelSlot() {
  const { isMembersPanelOpen, toggleMembersPanel } = useAppShell();
  if (!isMembersPanelOpen) return null;
  return <MembersPanel onClose={toggleMembersPanel} />;
}
