/**
 * Nexus FE 도메인 타입.
 * docs/product.md 4. 데이터 모델을 기준으로 FE에서 쓰기 쉬운 형태로 정의.
 * 실제 BE 계약이 확정되면 별도 api 타입과 매핑 레이어(`lib/api/mappers/*`)를 둔다.
 */

export type UserId = string;
export type ProjectId = string;
export type ChannelId = string;
export type TaskId = string; // "NX-142" 형식
export type InboxItemId = string;
export type MessageId = string;
export type TaskCommentId = string;
export type TaskActivityId = string;
export type CalendarEventId = string;
export type WorkspaceId = string;

export type Priority = "P1" | "P2" | "P3";

export type TaskStatus =
  | "Backlog"
  | "To do"
  | "In progress"
  | "In review"
  | "Done";

export type Presence = "online" | "offline";

export type ProjectStatus = "Active" | "Archived";

/**
 * 아바타 배경 색상 — User.avatarColor.
 * Tailwind 기본 팔레트를 그대로 쓰기 위해 의미적 키로 매핑.
 */
export type AvatarColor =
  | "blue"
  | "purple"
  | "green"
  | "pink"
  | "orange"
  | "yellow"
  | "teal";

export type ProjectColor =
  | "blue"
  | "purple"
  | "green"
  | "orange"
  | "pink"
  | "yellow";

export type LabelColor = "purple" | "blue" | "green" | "red" | "yellow";

export type User = {
  id: UserId;
  name: string;
  initials: string;
  avatarColor: AvatarColor;
  presence: Presence;
  role?: string;
  currentActivity?: string; // "Designing · #product-design"
};

export type Project = {
  id: ProjectId;
  slug: string;
  name: string;
  color: ProjectColor;
  status: ProjectStatus;
  linkedChannelId?: ChannelId;
  memberIds: ReadonlyArray<UserId>;
};

export type Channel = {
  id: ChannelId;
  name: string; // "launch-q2" (# 없이)
  type: "public" | "private" | "dm";
  unread?: number;
  description?: string; // 채널 헤더에 옆에 붙는 한 줄 설명
  memberCount?: number; // 채널 헤더 "8 members" 표시용
  pinnedCount?: number; // 헤더의 Pinned (n)
  linkedBoardProjectSlug?: string; // "Linked board" 버튼이 가리키는 보드
};

export type TaskLabel = {
  name: string;
  color: LabelColor;
};

export type Task = {
  id: TaskId;
  title: string;
  priority: Priority;
  status: TaskStatus;
  labels: ReadonlyArray<TaskLabel>;
  assigneeIds: ReadonlyArray<UserId>;
  dueLabel?: string; // "Apr 23" | "Today" | "Tomorrow" | "Thu" — FE 표시용
  commentCount?: number;
  attachmentCount?: number;
  projectId: ProjectId;
  linkedChannelId?: ChannelId;
};

export type InboxItemKind = "mention" | "reply" | "assigned" | "approval";

export type InboxItem = {
  id: InboxItemId;
  kind: InboxItemKind;
  authorId: UserId;
  /** 출처 라벨 — "#launch-q2" 또는 "Launch · Q2" 처럼 렌더된 문자열. */
  sourceLabel: string;
  body: string;
  relativeTime: string;
  isUnread?: boolean;
  dueBadge?: "Due Today" | "Overdue";
};

export type BoardColumnKey = Exclude<TaskStatus, "Done">;

export type BoardColumn = {
  key: BoardColumnKey;
  label: string;
  wipLimit?: number;
};

/** 메시지 반응 — 실제 BE에선 userIds 배열을 갖지만 FE 표시에는 count + mine이면 충분. */
export type MessageReaction = {
  emoji: string;
  count: number;
  mine?: boolean;
};

export type MessageAttachment = {
  name: string;
  /** FE 아이콘 결정용 단순 분류. */
  kind: "file" | "image";
  /** 부가 설명 — "Landing hero — copy variants v1.md"의 부제. */
  subtitle?: string;
};

/**
 * 채널/스레드 메시지.
 * - parentId가 없으면 채널 루트 메시지.
 * - parentId가 있으면 스레드 답글.
 */
export type Message = {
  id: MessageId;
  channelId: ChannelId;
  authorId: UserId;
  body: string;
  /** 표시용 시각 — "4:14 PM" 등. BE 도입 시 ISO로 교체 + 포매터 분리. */
  timeLabel: string;
  /** 날짜 그룹 키. 같은 값끼리 묶어 헤더 한 번만 렌더. */
  dateGroupKey: string;
  /** 날짜 그룹 헤더에 표시되는 라벨 — "Yesterday", "Today · Apr 21" 등. */
  dateGroupLabel: string;
  reactions?: ReadonlyArray<MessageReaction>;
  attachments?: ReadonlyArray<MessageAttachment>;
  /** 이 메시지가 속한 스레드의 루트 메시지 id. 없으면 루트 메시지. */
  parentId?: MessageId;
  /** 이 메시지가 루트일 때의 답글 개수. */
  replyCount?: number;
  /** 스레드 답글자 id 리스트 — 프리뷰 아바타 스택용. */
  threadParticipantIds?: ReadonlyArray<UserId>;
};

/**
 * Task 상세에 달리는 코멘트.
 * Activity와는 달리 실제 본문이 존재.
 */
export type TaskComment = {
  id: TaskCommentId;
  taskId: TaskId;
  authorId: UserId;
  body: string;
  /** 표시용 — "Yesterday 4:21 PM". */
  timeLabel: string;
};

/**
 * Task 활동 로그.
 * 작성 주체(actor) + 자연어 설명 문자열 — "moved this task from To do → In progress".
 */
export type TaskActivity = {
  id: TaskActivityId;
  taskId: TaskId;
  actorId: UserId;
  description: string;
  timeLabel: string;
};

/**
 * RSVP 상태 — BE Prisma `RsvpStatus` enum 과 1:1 일치.
 * 대문자는 BE 응답과 동일하게 유지 (변환 비용 0, 디버깅 쉬움).
 */
export type RsvpStatus = "PENDING" | "ACCEPTED" | "DECLINED" | "MAYBE";

/**
 * 캘린더 이벤트 참가자.
 * BE 응답의 `participants[]` 와 1:1 일치 — `user` 는 join 결과.
 */
export type CalendarParticipant = {
  userId: UserId;
  status: RsvpStatus;
  user: {
    id: UserId;
    name: string;
    avatar: string | null;
  };
};

/**
 * 캘린더 이벤트.
 *
 * BE `CalendarEventResponse` (be/src/modules/calendar/dto/event-response.dto.ts) 와 1:1 매칭.
 * 시각은 모두 ISO 8601 UTC 문자열. FE 에서 표시할 때 `new Date()` 로 파싱.
 */
export type CalendarEvent = {
  id: CalendarEventId;
  workspaceId: WorkspaceId;
  createdById: UserId;
  title: string;
  description: string | null;
  /** ISO 8601 UTC */
  startAt: string;
  /** ISO 8601 UTC */
  endAt: string;
  allDay: boolean;
  location: string | null;
  /** 자유 문자열 — FE 에서 알려진 토큰으로 매핑, unknown 은 fallback. */
  color: string | null;
  /** ISO 8601 */
  createdAt: string;
  /** ISO 8601 */
  updatedAt: string;
  participants: ReadonlyArray<CalendarParticipant>;
};
