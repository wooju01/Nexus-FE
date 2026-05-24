"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { useUser } from "@/features/auth/user-provider";
import { getAccessToken } from "@/lib/auth/tokens";
import {
  getProfileApi,
  updateProfileApi,
  updatePresenceApi,
  changePasswordApi,
  type UserProfile,
} from "@/lib/api/auth";
import { cn } from "@/lib/utils/cn";

type PresenceStatus = "ONLINE" | "AWAY" | "DND" | "OFFLINE";

const PRESENCE_OPTIONS: {
  value: PresenceStatus;
  label: string;
  dotClass: string;
}[] = [
  { value: "ONLINE", label: "온라인", dotClass: "bg-presence-online" },
  { value: "AWAY", label: "자리비움", dotClass: "bg-amber-400" },
  { value: "DND", label: "방해 금지", dotClass: "bg-priority-p1" },
  { value: "OFFLINE", label: "오프라인", dotClass: "bg-fg-tertiary" },
];

export function ProfileSettings() {
  const { user, refreshUser } = useUser();

  const [profile, setProfile] = useState<UserProfile | null>(null);

  // 이름 편집
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");
  const [nameSaving, setNameSaving] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);

  // 상태 변경
  const [presence, setPresence] = useState<PresenceStatus>("ONLINE");
  const [presenceSaving, setPresenceSaving] = useState(false);

  // 비밀번호 변경
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;
    getProfileApi(token)
      .then((p) => {
        setProfile(p);
        setName(p.name);
        setPresence(p.status);
      })
      .catch(console.error);
  }, []);

  async function handleSaveName() {
    if (!name.trim()) {
      setNameError("이름을 입력하세요.");
      return;
    }
    const token = getAccessToken();
    if (!token) return;
    setNameSaving(true);
    setNameError("");
    try {
      const updated = await updateProfileApi(token, { name: name.trim() });
      setProfile(updated);
      refreshUser?.();
      setNameSaved(true);
      setTimeout(() => setNameSaved(false), 2000);
    } catch (e) {
      setNameError(e instanceof Error ? e.message : "저장 실패");
    } finally {
      setNameSaving(false);
    }
  }

  async function handlePresenceChange(status: PresenceStatus) {
    const token = getAccessToken();
    if (!token) return;
    setPresenceSaving(true);
    try {
      await updatePresenceApi(token, status);
      setPresence(status);
    } catch {
      // 상태 변경 실패 시 이전 값 유지
    } finally {
      setPresenceSaving(false);
    }
  }

  async function handleChangePassword() {
    setPwError("");
    if (!currentPw || !newPw || !confirmPw) {
      setPwError("모든 항목을 입력하세요.");
      return;
    }
    if (newPw.length < 8) {
      setPwError("새 비밀번호는 8자 이상이어야 합니다.");
      return;
    }
    if (newPw !== confirmPw) {
      setPwError("새 비밀번호가 일치하지 않습니다.");
      return;
    }
    const token = getAccessToken();
    if (!token) return;
    setPwSaving(true);
    try {
      await changePasswordApi(token, currentPw, newPw);
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
      setPwSaved(true);
      setTimeout(() => setPwSaved(false), 2000);
    } catch (e) {
      setPwError(e instanceof Error ? e.message : "비밀번호 변경 실패");
    } finally {
      setPwSaving(false);
    }
  }

  const initials = (profile?.name ?? user?.name ?? "")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8 px-6 py-8">
      <h1 className="text-xl font-semibold text-fg-primary">프로필 설정</h1>

      {/* 아바타 + 기본 정보 */}
      <section className="rounded-xl border border-border-subtle bg-surface-elevated p-6">
        <h2 className="mb-5 text-sm font-semibold text-fg-primary">기본 정보</h2>

        <div className="flex items-center gap-5">
          <span
            role="img"
            aria-label={profile?.name ?? ""}
            className="inline-flex size-16 items-center justify-center rounded-full bg-sky-500 text-xl font-semibold text-white"
          >
            {initials || "??"}
          </span>
          <div className="min-w-0">
            <p className="text-base font-medium text-fg-primary">
              {profile?.name ?? "..."}
            </p>
            <p className="mt-0.5 text-sm text-fg-tertiary">
              {profile?.email ?? "..."}
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-1">
          <Label htmlFor="profile-name">표시 이름</Label>
          <div className="flex gap-2">
            <Input
              id="profile-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (nameError) setNameError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveName();
              }}
              placeholder="팀원에게 보이는 이름"
              hasError={Boolean(nameError)}
              className="flex-1"
            />
            <Button
              variant="secondary"
              size="md"
              onClick={handleSaveName}
              isLoading={nameSaving}
              disabled={nameSaving || name.trim() === (profile?.name ?? "")}
            >
              {nameSaved ? "저장됨 ✓" : "저장"}
            </Button>
          </div>
          <FieldError message={nameError} />
        </div>
      </section>

      {/* 상태 설정 */}
      <section className="rounded-xl border border-border-subtle bg-surface-elevated p-6">
        <h2 className="mb-5 text-sm font-semibold text-fg-primary">접속 상태</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {PRESENCE_OPTIONS.map((opt) => {
            const isSelected = presence === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                disabled={presenceSaving}
                onClick={() => handlePresenceChange(opt.value)}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl border px-3.5 py-3 text-sm font-medium transition-all",
                  isSelected
                    ? "border-accent bg-accent-subtle text-accent shadow-[0_0_0_1px_rgba(79,140,255,0.3)]"
                    : "border-border-default text-fg-secondary hover:border-border-strong hover:bg-surface-overlay hover:text-fg-primary",
                  presenceSaving && "cursor-not-allowed opacity-60",
                )}
              >
                <span
                  className={cn(
                    "size-2 shrink-0 rounded-full",
                    opt.dotClass,
                    !isSelected && "opacity-60",
                  )}
                />
                {opt.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* 비밀번호 변경 */}
      <section className="rounded-xl border border-border-subtle bg-surface-elevated p-6">
        <h2 className="mb-1 text-sm font-semibold text-fg-primary">비밀번호 변경</h2>
        <p className="mb-5 text-xs text-fg-tertiary">
          소셜 로그인 계정은 비밀번호를 변경할 수 없습니다.
        </p>

        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="current-pw">현재 비밀번호</Label>
            <PasswordInput
              id="current-pw"
              value={currentPw}
              onChange={(e) => {
                setCurrentPw(e.target.value);
                if (pwError) setPwError("");
              }}
              placeholder="현재 비밀번호"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="new-pw">새 비밀번호</Label>
            <PasswordInput
              id="new-pw"
              value={newPw}
              onChange={(e) => {
                setNewPw(e.target.value);
                if (pwError) setPwError("");
              }}
              placeholder="8자 이상"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="confirm-pw">새 비밀번호 확인</Label>
            <PasswordInput
              id="confirm-pw"
              value={confirmPw}
              onChange={(e) => {
                setConfirmPw(e.target.value);
                if (pwError) setPwError("");
              }}
              placeholder="새 비밀번호 재입력"
            />
          </div>

          <FieldError message={pwError} />

          <Button
            variant="primary"
            size="md"
            onClick={handleChangePassword}
            isLoading={pwSaving}
            disabled={pwSaving}
          >
            {pwSaved ? "변경됨 ✓" : "비밀번호 변경"}
          </Button>
        </div>
      </section>

      {/* 계정 정보 */}
      <section className="rounded-xl border border-border-subtle bg-surface-elevated p-6">
        <h2 className="mb-4 text-sm font-semibold text-fg-primary">계정 정보</h2>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-fg-tertiary">이메일</dt>
            <dd className="text-fg-primary">{profile?.email ?? "..."}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-fg-tertiary">가입일</dt>
            <dd className="text-fg-primary">
              {profile?.createdAt
                ? new Date(profile.createdAt).toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "..."}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-fg-tertiary">사용자 ID</dt>
            <dd className="font-mono text-xs text-fg-tertiary">
              {profile?.id ?? "..."}
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
