import type { Task } from "@/types/domain";

/**
 * Launch · Q2 보드 + 다른 프로젝트의 일부 Task.
 * 키스크린의 카드들을 그대로 반영.
 */
export const TASKS: ReadonlyArray<Task> = [
  // === In progress ===
  {
    id: "NX-119",
    title: "Hero section hand-off for dev",
    priority: "P1",
    status: "In progress",
    labels: [{ name: "launch-q2", color: "blue" }],
    assigneeIds: ["u-sejun"],
    dueLabel: "Today",
    commentCount: 18,
    projectId: "p-launch-q2",
    linkedChannelId: "ch-launch-q2",
  },
  {
    id: "NX-122",
    title: "Integrate Stripe pricing API",
    priority: "P2",
    status: "In progress",
    labels: [{ name: "eng", color: "blue" }],
    assigneeIds: ["u-yuna"],
    dueLabel: "Apr 24",
    projectId: "p-launch-q2",
  },
  {
    id: "NX-125",
    title: "Prep customer interview script",
    priority: "P3",
    status: "In progress",
    labels: [{ name: "research", color: "blue" }],
    assigneeIds: ["u-minho"],
    dueLabel: "Fri",
    projectId: "p-customer-onboarding",
  },

  // === To do ===
  {
    id: "NX-128",
    title: "Pricing table redesign",
    priority: "P1",
    status: "To do",
    labels: [
      { name: "design", color: "purple" },
      { name: "launch-q2", color: "blue" },
    ],
    assigneeIds: ["u-minho", "u-sora"],
    dueLabel: "Apr 23",
    commentCount: 12,
    attachmentCount: 3,
    projectId: "p-launch-q2",
    linkedChannelId: "ch-launch-q2",
  },
  {
    id: "NX-131",
    title: "Write copy variants for pricing",
    priority: "P2",
    status: "To do",
    labels: [{ name: "copy", color: "yellow" }],
    assigneeIds: ["u-sejun"],
    dueLabel: "Tomorrow",
    commentCount: 4,
    projectId: "p-launch-q2",
    linkedChannelId: "ch-launch-q2",
  },
  {
    id: "NX-133",
    title: "Motion token migration",
    priority: "P2",
    status: "To do",
    labels: [{ name: "design-sys", color: "green" }],
    assigneeIds: ["u-ethan"],
    dueLabel: "Apr 25",
    commentCount: 9,
    attachmentCount: 1,
    projectId: "p-launch-q2",
  },
  {
    id: "NX-134",
    title: "Audit spacing tokens across components",
    priority: "P3",
    status: "To do",
    labels: [{ name: "design-sys", color: "green" }],
    assigneeIds: ["u-hana", "u-sejun"],
    dueLabel: "Thu",
    commentCount: 2,
    projectId: "p-design-system-v3",
  },

  // === Backlog ===
  {
    id: "NX-142",
    title: "Empty state illustrations for Boards",
    priority: "P3",
    status: "Backlog",
    labels: [{ name: "design", color: "purple" }],
    assigneeIds: ["u-sora"],
    commentCount: 3,
    attachmentCount: 1,
    projectId: "p-launch-q2",
    linkedChannelId: "ch-launch-q2",
  },
  {
    id: "NX-143",
    title: "Audit color contrast on all dark surfaces",
    priority: "P3",
    status: "Backlog",
    labels: [{ name: "a11y", color: "blue" }],
    assigneeIds: ["u-hana"],
    projectId: "p-launch-q2",
  },
  {
    id: "NX-144",
    title: "Spec: role-based permissions v2",
    priority: "P2",
    status: "Backlog",
    labels: [
      { name: "spec", color: "yellow" },
      { name: "security", color: "red" },
    ],
    assigneeIds: ["u-sejun"],
    commentCount: 7,
    attachmentCount: 2,
    projectId: "p-launch-q2",
  },

  // === Additional "My tasks" bucket items (not in Launch · Q2) ===
  {
    id: "NX-150",
    title: "Follow up with onboarding cohort",
    priority: "P3",
    status: "To do",
    labels: [{ name: "research", color: "blue" }],
    assigneeIds: ["u-sejun"],
    dueLabel: "Next week",
    projectId: "p-customer-onboarding",
  },
];

export function getTasksByProjectId(projectId: string): ReadonlyArray<Task> {
  return TASKS.filter((t) => t.projectId === projectId);
}

export function getTasksAssignedTo(userId: string): ReadonlyArray<Task> {
  return TASKS.filter((t) => t.assigneeIds.includes(userId));
}

export function getTask(id: string): Task | undefined {
  return TASKS.find((t) => t.id === id);
}
