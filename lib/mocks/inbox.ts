import type { InboxItem } from "@/types/domain";

/**
 * Home 화면의 Inbox 리스트 키스크린 그대로.
 */
export const INBOX_ITEMS: ReadonlyArray<InboxItem> = [
  {
    id: "ib-1",
    kind: "mention",
    authorId: "u-sora",
    sourceLabel: "#launch-q2",
    body: "@sejun 랜딩 페이지 카피 초안 피드백 부탁해요",
    relativeTime: "4m",
    isUnread: true,
  },
  {
    id: "ib-2",
    kind: "assigned",
    authorId: "u-minho",
    sourceLabel: "Launch · Q2",
    body: "Review: Pricing table redesign",
    relativeTime: "22m",
    dueBadge: "Due Today",
  },
  {
    id: "ib-3",
    kind: "reply",
    authorId: "u-hana",
    sourceLabel: "#product-design",
    body: 'Reply in thread · "컴포넌트 네이밍 컨벤션..."',
    relativeTime: "1h",
  },
  {
    id: "ib-4",
    kind: "approval",
    authorId: "u-ethan",
    sourceLabel: "Design system v3",
    body: "Approve: Motion token migration",
    relativeTime: "2h",
  },
  {
    id: "ib-5",
    kind: "mention",
    authorId: "u-yuna",
    sourceLabel: "#engineering",
    body: "@sejun 스펙 문서의 권한 섹션 확인 좀 해주세요",
    relativeTime: "3h",
  },
];
