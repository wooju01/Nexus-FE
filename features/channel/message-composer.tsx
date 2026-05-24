"use client";

import { useState } from "react";

import {
  FlagIcon,
  MicIcon,
  PaperclipIcon,
  SmileIcon,
  SparklesIcon,
} from "@/components/icons";
import { cn } from "@/lib/utils/cn";

type MessageComposerProps = {
  /** placeholder에 들어갈 채널/스레드 라벨 — "#launch-q2" 또는 "thread". */
  placeholderTarget: string;
  /** 스레드 컴포저는 "Send & create task" 숨김 + 버튼 라벨 단축. */
  variant?: "channel" | "thread";
};

/**
 * 메시지 입력창.
 * 실제 전송/마크다운 파싱은 미구현. 전송 시 onSubmit 콘솔 로그만.
 */
export function MessageComposer({
  placeholderTarget,
  variant = "channel",
}: MessageComposerProps) {
  const [draft, setDraft] = useState("");

  const isChannel = variant === "channel";

  const onSend = () => {
    if (draft.trim().length === 0) return;
    // TODO(sejun): 실제 전송 연동. 현재는 로컬 상태만 초기화.
    console.info("[mock send]", { target: placeholderTarget, body: draft });
    setDraft("");
  };

  return (
    <div
      className={cn(
        "shrink-0 border-t border-border-subtle bg-surface-base px-4 py-3",
        isChannel ? "px-5" : "px-4",
      )}
    >
      <div className="rounded-lg border border-border-subtle bg-surface-subtle">
        {/* 포맷 툴바 */}
        <div className="flex items-center gap-0.5 border-b border-border-subtle px-2 py-1.5">
          <FormatButton>
            <span className="font-semibold">B</span>
          </FormatButton>
          <FormatButton>
            <span className="italic">I</span>
          </FormatButton>
          <FormatButton>
            <span className="line-through">S</span>
          </FormatButton>
          <Divider />
          <FormatButton>
            <span>/</span>
          </FormatButton>
          <FormatButton>
            <span className="font-mono text-xs">&lt;/&gt;</span>
          </FormatButton>
          <div className="ml-auto">
            <FormatButton title="AI 작성 — 준비 중">
              <SparklesIcon className="size-4 text-accent" />
            </FormatButton>
          </div>
        </div>

        {/* 본문 */}
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={isChannel ? 3 : 2}
          placeholder={
            isChannel ? `Message ${placeholderTarget}...` : `Reply to thread...`
          }
          aria-label="메시지 입력"
          className="block w-full resize-none bg-transparent px-3 py-2 text-sm text-fg-primary placeholder:text-fg-tertiary focus:outline-none"
        />

        {/* 하단 액션 바 */}
        <div className="flex items-center gap-2 px-2 py-1.5">
          <div className="flex items-center gap-0.5">
            <IconButton title="파일 첨부">
              <PaperclipIcon className="size-4" />
            </IconButton>
            <IconButton title="이모지">
              <SmileIcon className="size-4" />
            </IconButton>
            <IconButton title="음성 메시지">
              <MicIcon className="size-4" />
            </IconButton>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {isChannel ? (
              <button
                type="button"
                title="메시지를 Task로 전환 — 준비 중"
                className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-fg-secondary hover:bg-surface-elevated hover:text-fg-primary"
              >
                <FlagIcon className="size-3.5" />
                Send &amp; create task
              </button>
            ) : null}

            <button
              type="button"
              onClick={onSend}
              disabled={draft.trim().length === 0}
              className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-white hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span aria-hidden="true">▶</span>
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FormatButton({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <button
      type="button"
      title={title ?? "서식 — 준비 중"}
      className="flex size-7 items-center justify-center rounded text-sm text-fg-secondary hover:bg-surface-elevated hover:text-fg-primary"
    >
      {children}
    </button>
  );
}

function IconButton({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <button
      type="button"
      title={`${title} — 준비 중`}
      className="flex size-7 items-center justify-center rounded text-fg-secondary hover:bg-surface-elevated hover:text-fg-primary"
    >
      {children}
    </button>
  );
}

function Divider() {
  return (
    <span
      aria-hidden="true"
      className="mx-1 h-4 w-px bg-border-subtle"
    />
  );
}
