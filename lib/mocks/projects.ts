import type { Project, ProjectId } from "@/types/domain";

export const PROJECTS: ReadonlyArray<Project> = [
  {
    id: "p-launch-q2",
    slug: "launch-q2",
    name: "Launch · Q2",
    color: "blue",
    status: "Active",
    linkedChannelId: "ch-launch-q2",
    memberIds: [
      "u-sora",
      "u-minho",
      "u-hana",
      "u-ethan",
      "u-yuna",
      "u-sejun",
      "u-wooju",
    ],
  },
  {
    id: "p-platform-migration",
    slug: "platform-migration",
    name: "Platform migration",
    color: "purple",
    status: "Active",
    memberIds: ["u-ethan", "u-yuna", "u-sejun", "u-wooju"],
  },
  {
    id: "p-design-system-v3",
    slug: "design-system-v3",
    name: "Design system v3",
    color: "green",
    status: "Active",
    memberIds: ["u-hana", "u-ethan", "u-minho"],
  },
  {
    id: "p-customer-onboarding",
    slug: "customer-onboarding",
    name: "Customer onboarding",
    color: "orange",
    status: "Active",
    memberIds: ["u-minho", "u-sora"],
  },
];

const PROJECT_BY_ID: Record<ProjectId, Project> = Object.fromEntries(
  PROJECTS.map((p) => [p.id, p]),
);

const PROJECT_BY_SLUG: Record<string, Project> = Object.fromEntries(
  PROJECTS.map((p) => [p.slug, p]),
);

export function getProject(id: ProjectId): Project | undefined {
  return PROJECT_BY_ID[id];
}

export function getProjectBySlug(slug: string): Project | undefined {
  return PROJECT_BY_SLUG[slug];
}
