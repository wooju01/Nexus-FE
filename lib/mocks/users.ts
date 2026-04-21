import type { User, UserId } from "@/types/domain";

/**
 * 키스크린의 팀원을 그대로 모델링.
 * 현재 사용자는 Sejun Yun (SY).
 */
export const USERS: ReadonlyArray<User> = [
  {
    id: "u-sejun",
    name: "Sejun Yun",
    initials: "SY",
    avatarColor: "blue",
    presence: "online",
    role: "Product Engineering",
  },
  {
    id: "u-sora",
    name: "Sora Kim",
    initials: "SK",
    avatarColor: "pink",
    presence: "online",
    currentActivity: "Designing · #product-design",
  },
  {
    id: "u-minho",
    name: "Minho Lee",
    initials: "ML",
    avatarColor: "purple",
    presence: "online",
    currentActivity: "Reviewing · Launch · Q2",
  },
  {
    id: "u-ethan",
    name: "Ethan Park",
    initials: "EP",
    avatarColor: "orange",
    presence: "online",
    currentActivity: "Coding · Design system v3",
  },
  {
    id: "u-hana",
    name: "Hana Jeong",
    initials: "HJ",
    avatarColor: "green",
    presence: "online",
    currentActivity: "In thread · #product-design",
  },
  {
    id: "u-yuna",
    name: "Yuna Choi",
    initials: "YC",
    avatarColor: "yellow",
    presence: "online",
    currentActivity: "Writing spec · #engineering",
  },
  {
    id: "u-wooju",
    name: "Wooju Kim",
    initials: "WK",
    avatarColor: "teal",
    presence: "online",
    role: "Platform Engineering",
    currentActivity: "Coding · Platform migration",
  },
];

export const CURRENT_USER_ID: UserId = "u-sejun";

const USER_BY_ID: Record<UserId, User> = Object.fromEntries(
  USERS.map((u) => [u.id, u]),
);

export function getUser(id: UserId): User | undefined {
  return USER_BY_ID[id];
}

export function getCurrentUser(): User {
  const u = USER_BY_ID[CURRENT_USER_ID];
  if (!u) {
    throw new Error("Mock data is inconsistent: current user not found");
  }
  return u;
}
