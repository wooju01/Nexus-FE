import { notFound } from "next/navigation";

import { BoardView } from "@/features/board/board-view";
import { getProjectBySlug } from "@/lib/mocks/projects";
import { getTasksByProjectId } from "@/lib/mocks/tasks";

type ProjectPageProps = {
  // Next.js 16: params / searchParams 둘 다 Promise.
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ task?: string }>;
};

export default async function ProjectBoardPage({
  params,
  searchParams,
}: ProjectPageProps) {
  const [{ slug }, { task }] = await Promise.all([params, searchParams]);
  const project = getProjectBySlug(slug);
  if (!project) {
    notFound();
  }

  const tasks = getTasksByProjectId(project.id);

  return (
    <BoardView project={project} tasks={tasks} selectedTaskId={task} />
  );
}
