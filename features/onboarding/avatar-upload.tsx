"use client";

import Image from "next/image";
import { useRef, useState } from "react";

import { cn } from "@/lib/utils/cn";

type AvatarUploadProps = {
  displayName: string;
  onFileSelect: (file: File | null) => void;
};

/**
 * 아바타 업로드 컴포넌트.
 * 그라데이션 링 + 카메라 오버레이로 시각적 힌트 제공.
 * BE 업로드 API 연동 전까지는 로컬 프리뷰만 지원.
 */
export function AvatarUpload({ displayName, onFileSelect }: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const initials = displayName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");

  function handleClick() {
    inputRef.current?.click();
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      onFileSelect(file);
    } else {
      setPreview(null);
      onFileSelect(null);
    }
  }

  function handleRemove() {
    setPreview(null);
    onFileSelect(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {/* 그라데이션 링 래퍼 */}
      <div className="relative rounded-full bg-gradient-to-br from-accent via-brand-glow to-accent/60 p-[2px]">
        <button
          type="button"
          onClick={handleClick}
          className={cn(
            "group relative size-24 rounded-full overflow-hidden",
            "bg-surface-elevated",
            "transition-all cursor-pointer",
            "flex items-center justify-center",
          )}
          aria-label="프로필 사진 업로드"
        >
          {preview ? (
            <Image
              src={preview}
              alt="프로필 미리보기"
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <span className="flex flex-col items-center">
              {initials ? (
                <span className="text-2xl font-bold text-fg-secondary">
                  {initials}
                </span>
              ) : (
                <svg
                  className="size-8 text-fg-tertiary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0"
                  />
                </svg>
              )}
            </span>
          )}

          {/* 카메라 오버레이 — hover 시 표시 */}
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 transition-colors group-hover:bg-black/40">
            <svg
              className="size-5 text-white opacity-0 transition-opacity group-hover:opacity-100"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z"
              />
            </svg>
          </span>
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={handleChange}
        className="hidden"
        aria-hidden="true"
      />

      {preview ? (
        <button
          type="button"
          onClick={handleRemove}
          className="text-xs text-fg-tertiary hover:text-priority-p1 transition-colors"
        >
          사진 제거
        </button>
      ) : (
        <p className="text-xs text-fg-tertiary">클릭하여 사진 추가</p>
      )}
    </div>
  );
}
