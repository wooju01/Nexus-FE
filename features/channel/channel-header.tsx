import Link from "next/link";

import { BoardPanelIcon, HashIcon, PinIcon, SearchIcon } from "@/components/icons";
import { Avatar } from "@/components/ui/avatar";
import { getUser } from "@/lib/mocks/users";
import type { Channel } from "@/types/domain";

type ChannelHeaderProps = {
  channel: Channel;
  /** 헤더 오른쪽 아바타 스택에 노출할 사용자 id들. */
  memberPreviewIds: ReadonlyArray<string>;
};

/**
 * 채널 상단 헤더 바.
 * - # 이름 + 설명 + 멤버 스택 + Pinned / Linked board / Search 액션.
 */
export function ChannelHeader({
  channel,
  memberPreviewIds,
}: ChannelHeaderProps) {
  const previewMembers = memberPreviewIds
    .map((id) => getUser(id))
    .filter((u): u is NonNullable<typeof u> => Boolean(u))
    .slice(0, 5);

  const memberCount = channel.memberCount ?? previewMembers.length;
  const pinnedCount = channel.pinnedCount ?? 0;
  const linkedBoardHref = channel.linkedBoardProjectSlug
    ? `/projects/${channel.linkedBoardProjectSlug}`
    : undefined;

  return (
    <header className="flex shrink-0 items-center gap-4 border-b border-border-subtle bg-surface-base px-5 py-3">
      <div className="flex min-w-0 items-center gap-2">
        <HashIcon className="size-4 text-fg-tertiary" />
        <h1 className="truncate text-base font-semibold text-fg-primary">
          {channel.name}
        </h1>
        {channel.description ? (
          <span className="truncate text-sm text-fg-tertiary">
            <span aria-hidden="true" className="mx-2">
              |
            </span>
            {channel.description}
          </span>
        ) : null}
      </div>

      <div className="ml-auto flex items-center gap-3">
        <div
          className="flex items-center gap-2"
          aria-label={`${memberCount}명의 멤버`}
        >
          <div className="flex -space-x-1.5">
            {previewMembers.map((u) => (
              <Avatar
                key={u.id}
                initials={u.initials}
                color={u.avatarColor}
                size="xs"
                presence={u.presence}
                name={u.name}
                className="ring-2 ring-surface-base"
              />
            ))}
          </div>
          <span className="text-xs font-medium text-fg-secondary">
            {memberCount} members
          </span>
        </div>

        <HeaderAction icon={<PinIcon className="size-4" />}>
          Pinned ({pinnedCount})
        </HeaderAction>

        {linkedBoardHref ? (
          <HeaderAction
            icon={<BoardPanelIcon className="size-4" />}
            href={linkedBoardHref}
          >
            Linked board
          </HeaderAction>
        ) : null}

        <HeaderAction icon={<SearchIcon className="size-4" />}>
          Search
        </HeaderAction>
      </div>
    </header>
  );
}

function HeaderAction({
  icon,
  href,
  children,
}: {
  icon: React.ReactNode;
  href?: string;
  children: React.ReactNode;
}) {
  const className =
    "flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-fg-secondary transition-colors hover:bg-surface-elevated hover:text-fg-primary";

  if (href) {
    return (
      <Link href={href} className={className}>
        {icon}
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={className} title="준비 중">
      {icon}
      {children}
    </button>
  );
}
