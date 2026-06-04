import { BoardIcon, HashIcon, StarIcon } from "@/components/icons";
import { Avatar } from "@/components/ui/avatar";
import { isStarred, toggleStarred, type StarredItem } from "@/lib/store/starred";
import { cn } from "@/lib/utils/cn";

const STATUS_PRESENCE = {
  ONLINE: "online",
  AWAY: "away",
  DND: "dnd",
  OFFLINE: "offline",
} as const;

type DmUser = { name: string; status: string };

export function ItemIcon({
  type,
  dmUser,
}: {
  type: StarredItem["type"] | "channel" | "project" | "dm";
  name?: string;
  dmUser?: DmUser;
}) {
  if (type === "channel") return <HashIcon className="size-4 shrink-0 text-fg-tertiary" />;
  if (type === "project") return <BoardIcon className="size-4 shrink-0 text-fg-tertiary" />;
  if (type === "dm" && dmUser) {
    return (
      <Avatar
        initials={dmUser.name[0]?.toUpperCase() ?? "?"}
        color="blue"
        presence={STATUS_PRESENCE[dmUser.status as keyof typeof STATUS_PRESENCE]}
        size="xs"
        name={dmUser.name}
      />
    );
  }
  return <HashIcon className="size-4 shrink-0 text-fg-tertiary" />;
}

export function StarButton({
  wsId,
  item,
  onToggle,
}: {
  wsId: string;
  item: StarredItem;
  onToggle: (item: StarredItem) => void;
}) {
  const starred = isStarred(wsId, item.id);
  return (
    <button
      type="button"
      aria-label={starred ? "즐겨찾기 해제" : "즐겨찾기 추가"}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggle(item); }}
      className={cn(
        "ml-auto flex size-5 shrink-0 items-center justify-center rounded transition-colors",
        starred
          ? "text-yellow-400 opacity-100"
          : "text-fg-tertiary opacity-0 group-hover:opacity-100 hover:text-yellow-400",
      )}
    >
      <StarIcon className={cn("size-3.5", starred && "fill-yellow-400")} />
    </button>
  );
}
