import { Avatar } from "@/components/ui/avatar";
import { CURRENT_USER_ID, USERS } from "@/lib/mocks/users";

/**
 * 팀 실시간 활동 위젯.
 * - currentActivity가 있는 사용자만 노출.
 * - 현재 사용자는 제외.
 */
export function TeamPresence() {
  const others = USERS.filter(
    (u) => u.id !== CURRENT_USER_ID && u.currentActivity,
  );

  return (
    <section
      aria-label="팀 현황"
      className="rounded-lg border border-border-subtle bg-surface-subtle"
    >
      <header className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
        <h2 className="text-sm font-semibold text-fg-primary">Team presence</h2>
        <span className="text-xs text-fg-tertiary">{others.length} online</span>
      </header>

      <ul className="divide-y divide-border-subtle">
        {others.map((user) => (
          <li
            key={user.id}
            className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-surface-elevated"
          >
            <Avatar
              initials={user.initials}
              color={user.avatarColor}
              size="sm"
              presence={user.presence}
              name={user.name}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-fg-primary">{user.name}</p>
              <p className="truncate text-xs text-fg-tertiary">
                {user.currentActivity}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
