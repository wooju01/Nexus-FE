import type { Channel, ChannelId } from "@/types/domain";

/**
 * 키스크린에 등장하는 채널 + 헤더 메타데이터.
 * description / memberCount / pinnedCount 는 채널 뷰 헤더에서 바로 소비된다.
 */
export const CHANNELS: ReadonlyArray<Channel> = [
  {
    id: "ch-product-design",
    name: "product-design",
    type: "public",
    description: "Design 논의 · 크리틱 · 리소스",
    memberCount: 12,
    pinnedCount: 2,
  },
  {
    id: "ch-engineering",
    name: "engineering",
    type: "public",
    unread: 4,
    description: "엔지니어링 전체",
    memberCount: 14,
    pinnedCount: 5,
  },
  {
    id: "ch-launch-q2",
    name: "launch-q2",
    type: "public",
    description: "Launch Q2 팀의 전용 채널",
    memberCount: 8,
    pinnedCount: 3,
    linkedBoardProjectSlug: "launch-q2",
  },
  {
    id: "ch-general",
    name: "general",
    type: "public",
    description: "팀 전체 공지",
    memberCount: 24,
  },
  {
    id: "ch-random",
    name: "random",
    type: "public",
    description: "점심 · 잡담 · 짤",
    memberCount: 24,
  },
];

const CHANNEL_BY_ID: Record<ChannelId, Channel> = Object.fromEntries(
  CHANNELS.map((c) => [c.id, c]),
);

const CHANNEL_BY_NAME: Record<string, Channel> = Object.fromEntries(
  CHANNELS.map((c) => [c.name, c]),
);

export function getChannel(id: ChannelId): Channel | undefined {
  return CHANNEL_BY_ID[id];
}

export function getChannelByName(name: string): Channel | undefined {
  return CHANNEL_BY_NAME[name];
}
