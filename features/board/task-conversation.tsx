import { Avatar } from "@/components/ui/avatar";
import {
  getTaskActivities,
  getTaskComments,
} from "@/lib/mocks/task-comments";
import { getUser } from "@/lib/mocks/users";

import type { TaskId } from "@/types/domain";

import { TabButton } from "./task-detail-atoms";

/**
 * Task 상세 우측 패인의 Conversation 탭 내용 + 탭 바.
 * 현재는 Conversation만 활성. Description/Sub-tasks/Activity는 후속 단계에서 각 탭 컴포넌트로 분리.
 */

type TaskConversationProps = {
  taskId: TaskId;
};

export function TaskConversation({ taskId }: TaskConversationProps) {
  const activities = getTaskActivities(taskId);
  const comments = getTaskComments(taskId);

  return (
    <>
      <nav
        role="tablist"
        aria-label="상세 탭"
        className="flex items-center gap-4 border-b border-border-subtle px-5"
      >
        <TabButton active>
          Conversation
          <span className="ml-1.5 text-xs text-fg-tertiary">
            {comments.length}
          </span>
        </TabButton>
        <TabButton>Description</TabButton>
        <TabButton>Sub-tasks</TabButton>
        <TabButton>Activity</TabButton>
      </nav>

      <ul className="space-y-4 px-5 py-4">
        {activities.map((a) => {
          const actor = getUser(a.actorId);
          if (!actor) return null;
          return (
            <li
              key={a.id}
              className="flex items-start gap-3 text-xs text-fg-secondary"
            >
              <Avatar
                initials={actor.initials}
                color={actor.avatarColor}
                size="xs"
                name={actor.name}
              />
              <p className="flex-1 leading-relaxed">
                <span className="font-medium text-fg-primary">{actor.name}</span>{" "}
                {a.description}
              </p>
              <time className="shrink-0 text-fg-tertiary">{a.timeLabel}</time>
            </li>
          );
        })}

        {comments.map((c) => {
          const author = getUser(c.authorId);
          if (!author) return null;
          return (
            <li key={c.id} className="flex items-start gap-3">
              <Avatar
                initials={author.initials}
                color={author.avatarColor}
                size="sm"
                presence={author.presence}
                name={author.name}
              />
              <div className="min-w-0 flex-1">
                <header className="flex items-baseline gap-2">
                  <span className="text-sm font-semibold text-fg-primary">
                    {author.name}
                  </span>
                  <time className="text-[11px] font-mono text-fg-tertiary">
                    {c.timeLabel}
                  </time>
                </header>
                <p className="mt-0.5 whitespace-pre-wrap break-words text-sm leading-relaxed text-fg-primary">
                  {c.body}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
