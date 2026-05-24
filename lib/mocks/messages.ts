import type { ChannelId, Message, MessageId } from "@/types/domain";

/**
 * 채널 루트 메시지 + 스레드 답글.
 * 키스크린(launch-q2)의 대화 내용을 그대로 반영.
 */
export const MESSAGES: ReadonlyArray<Message> = [
  // ─── 어제 launch-q2 ───
  {
    id: "msg-1",
    channelId: "ch-launch-q2",
    authorId: "u-minho",
    body: "Pricing page 방향 잡으려고 하는데, 3-tier vs usage-based 중에 고민이에요. 다들 어떻게 생각하세요?",
    timeLabel: "4:14 PM",
    dateGroupKey: "yesterday",
    dateGroupLabel: "Yesterday",
    reactions: [{ emoji: "🤔", count: 3 }],
  },
  {
    id: "msg-2",
    channelId: "ch-launch-q2",
    authorId: "u-sora",
    body: "고객 인터뷰에선 3-tier가 decision fatigue를 줄였어요. Usage-based는 enterprise에만 노출해도 될 것 같아요.",
    timeLabel: "4:21 PM",
    dateGroupKey: "yesterday",
    dateGroupLabel: "Yesterday",
    reactions: [
      { emoji: "💯", count: 4 },
      { emoji: "👀", count: 2 },
    ],
  },
  {
    id: "msg-3",
    channelId: "ch-launch-q2",
    authorId: "u-ethan",
    body: '저도 동의. 다만 "Team" tier의 seat 개수를 20 → 25로 올리는 게 어떨까요? 경쟁사 대비 여유 있게.',
    timeLabel: "4:45 PM",
    dateGroupKey: "yesterday",
    dateGroupLabel: "Yesterday",
  },

  // ─── 오늘 Apr 21 ───
  {
    id: "msg-4",
    channelId: "ch-launch-q2",
    authorId: "u-sora",
    body: "@sejun 랜딩 페이지 카피 초안 피드백 부탁해요. 3가지 방향으로 썼습니다:",
    timeLabel: "9:02 AM",
    dateGroupKey: "today-apr-21",
    dateGroupLabel: "Today · Apr 21",
    reactions: [{ emoji: "👀", count: 3 }],
    attachments: [
      {
        name: "Landing hero — copy variants v1.md",
        kind: "file",
        subtitle: "3개 방향 · 2KB",
      },
    ],
  },
  {
    // 스레드 루트.
    id: "msg-5",
    channelId: "ch-launch-q2",
    authorId: "u-minho",
    body: "A안 + B안 subhead 조합이면 어떨까요? 그리고 이 건 Pricing redesign 카드에 연결해서 작업하는 게 깔끔할 것 같은데요.",
    timeLabel: "9:34 AM",
    dateGroupKey: "today-apr-21",
    dateGroupLabel: "Today · Apr 21",
    replyCount: 8,
    threadParticipantIds: ["u-hana", "u-ethan", "u-sora", "u-yuna", "u-wooju"],
  },

  // ─── msg-5의 스레드 답글 (5건 노출, 총 8건) ───
  {
    id: "msg-5-r1",
    channelId: "ch-launch-q2",
    authorId: "u-hana",
    body: "동의해요. 저희 쪽에서 이미 mock 버전은 준비됨.",
    timeLabel: "9:40 AM",
    dateGroupKey: "today-apr-21",
    dateGroupLabel: "Today · Apr 21",
    parentId: "msg-5",
  },
  {
    id: "msg-5-r2",
    channelId: "ch-launch-q2",
    authorId: "u-ethan",
    body: 'Subhead는 "Chat, tasks, and docs — connected." 어때요?',
    timeLabel: "9:44 AM",
    dateGroupKey: "today-apr-21",
    dateGroupLabel: "Today · Apr 21",
    parentId: "msg-5",
    reactions: [{ emoji: "🔥", count: 3 }],
  },
  {
    id: "msg-5-r3",
    channelId: "ch-launch-q2",
    authorId: "u-sora",
    body: "채택. A + 이 subhead로 가죠.",
    timeLabel: "9:48 AM",
    dateGroupKey: "today-apr-21",
    dateGroupLabel: "Today · Apr 21",
    parentId: "msg-5",
  },
  {
    id: "msg-5-r4",
    channelId: "ch-launch-q2",
    authorId: "u-hana",
    body: "디자인 반영 완료, PR #2415.",
    timeLabel: "10:11 AM",
    dateGroupKey: "today-apr-21",
    dateGroupLabel: "Today · Apr 21",
    parentId: "msg-5",
  },
  {
    id: "msg-5-r5",
    channelId: "ch-launch-q2",
    authorId: "u-ethan",
    body: "spacing-token 관련해서 컴포넌트 사이드 이펙트 있는지 체크 중.",
    timeLabel: "10:47 AM",
    dateGroupKey: "today-apr-21",
    dateGroupLabel: "Today · Apr 21",
    parentId: "msg-5",
  },
];

/**
 * 채널 루트 메시지 (스레드 답글 제외) — 시간 순 정렬 유지.
 */
export function getRootMessagesForChannel(
  channelId: ChannelId,
): ReadonlyArray<Message> {
  return MESSAGES.filter((m) => m.channelId === channelId && !m.parentId);
}

/**
 * 특정 메시지의 스레드 답글.
 */
export function getThreadReplies(rootId: MessageId): ReadonlyArray<Message> {
  return MESSAGES.filter((m) => m.parentId === rootId);
}

export function getMessage(id: MessageId): Message | undefined {
  return MESSAGES.find((m) => m.id === id);
}
