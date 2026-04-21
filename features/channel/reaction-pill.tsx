import { cn } from "@/lib/utils/cn";
import type { MessageReaction } from "@/types/domain";

type ReactionPillProps = {
  reaction: MessageReaction;
};

/**
 * 메시지 아래에 붙는 이모지 반응 칩.
 * `mine`이면 accent 틴트를 입힌다.
 */
export function ReactionPill({ reaction }: ReactionPillProps) {
  return (
    <button
      type="button"
      title="반응 — 준비 중"
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-xs transition-colors",
        reaction.mine
          ? "border-accent/50 bg-accent/15 text-accent"
          : "border-border-subtle bg-surface-elevated text-fg-secondary hover:border-border-default hover:text-fg-primary",
      )}
    >
      <span aria-hidden="true" className="text-sm leading-none">
        {reaction.emoji}
      </span>
      <span className="font-medium">{reaction.count}</span>
    </button>
  );
}
