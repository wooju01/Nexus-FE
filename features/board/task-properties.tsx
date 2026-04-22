import Link from "next/link";

import { HashIcon } from "@/components/icons";
import { Avatar } from "@/components/ui/avatar";
import { LabelPill } from "@/components/ui/label-pill";
import { PriorityPill } from "@/components/ui/priority-pill";
import { getChannel } from "@/lib/mocks/channels";
import { getProject } from "@/lib/mocks/projects";
import { getUser } from "@/lib/mocks/users";
import { cn } from "@/lib/utils/cn";

import type { Task, TaskStatus } from "@/types/domain";

import { Row } from "./task-detail-atoms";

/**
 * Task 상세 우측 패인 상단의 속성 그리드(Status / Priority / Assignees / Due / Project / Labels / Linked channel).
 * 프로젝트/채널 링크는 존재할 때만 렌더하고, 없으면 해당 행을 생략.
 */

const STATUS_DOT_CLASS: Record<TaskStatus, string> = {
  Backlog: "bg-status-backlog",
  "To do": "bg-status-todo",
  "In progress": "bg-status-in-progress",
  "In review": "bg-status-in-review",
  Done: "bg-status-done",
};

type TaskPropertiesProps = {
  task: Task;
};

export function TaskProperties({ task }: TaskPropertiesProps) {
  const assignees = task.assigneeIds
    .map((id) => getUser(id))
    .filter((u): u is NonNullable<typeof u> => Boolean(u));
  const project = getProject(task.projectId);
  const linkedChannel = task.linkedChannelId
    ? getChannel(task.linkedChannelId)
    : undefined;

  return (
    <dl className="grid grid-cols-[7rem_1fr] gap-y-2.5 border-y border-border-subtle bg-surface-subtle/40 px-5 py-4 text-sm">
      <Row label="Status">
        <span className="inline-flex items-center gap-2">
          <span
            aria-hidden="true"
            className={cn("size-2 rounded-sm", STATUS_DOT_CLASS[task.status])}
          />
          <span className="text-fg-primary">{task.status}</span>
        </span>
      </Row>

      <Row label="Priority">
        <PriorityPill priority={task.priority} />
      </Row>

      <Row label="Assignees">
        {assignees.length === 0 ? (
          <span className="text-fg-tertiary">미지정</span>
        ) : (
          <ul className="flex flex-wrap gap-x-3 gap-y-1">
            {assignees.map((u) => (
              <li key={u.id} className="flex items-center gap-1.5">
                <Avatar
                  initials={u.initials}
                  color={u.avatarColor}
                  size="xs"
                  presence={u.presence}
                  name={u.name}
                />
                <span className="text-fg-primary">{u.name}</span>
              </li>
            ))}
          </ul>
        )}
      </Row>

      <Row label="Due date">
        <span className={task.dueLabel ? "text-fg-primary" : "text-fg-tertiary"}>
          {task.dueLabel ?? "No due date"}
        </span>
      </Row>

      {project ? (
        <Row label="Project">
          <Link
            href={`/projects/${project.slug}`}
            className="inline-flex items-center gap-2 text-fg-primary hover:text-accent"
          >
            <span
              aria-hidden="true"
              className="size-2 shrink-0 rounded-sm bg-sky-500"
            />
            {project.name}
          </Link>
        </Row>
      ) : null}

      {task.labels.length > 0 ? (
        <Row label="Labels">
          <div className="flex flex-wrap gap-1">
            {task.labels.map((l) => (
              <LabelPill key={l.name} label={l.name} color={l.color} />
            ))}
          </div>
        </Row>
      ) : null}

      {linkedChannel ? (
        <Row label="Linked channel">
          <Link
            href={`/channels/${linkedChannel.name}`}
            className="inline-flex items-center gap-1 text-fg-primary hover:text-accent"
          >
            <HashIcon className="size-3.5 text-fg-tertiary" />
            {linkedChannel.name}
            <span className="text-xs text-fg-tertiary"> · auto-linked</span>
          </Link>
        </Row>
      ) : null}
    </dl>
  );
}
