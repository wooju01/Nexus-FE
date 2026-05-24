"use client";

import { Suspense, use, useEffect, useState } from "react";
import { notFound } from "next/navigation";

import { getAccessToken } from "@/lib/auth/tokens";
import { getProjectApi, type Project } from "@/lib/api/project";
import { BoardView } from "@/features/board/board-view";

type ProjectBoardPageProps = {
  // slug 파라미터명이지만 실제값은 project id(cuid)
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ task?: string }>;
};

export default function ProjectBoardPage({
  params,
  searchParams,
}: ProjectBoardPageProps) {
  const { slug: projectId } = use(params);
  const { task: selectedTaskId } = use(searchParams);

  const [project, setProject] = useState<Project | null>(null);
  const [isNotFound, setIsNotFound] = useState(false);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;
    getProjectApi(token, projectId)
      .then(setProject)
      .catch(() => setIsNotFound(true));
  }, [projectId]);

  if (isNotFound) notFound();

  return (
    <Suspense fallback={null}>
      <BoardView project={project} selectedTaskId={selectedTaskId} />
    </Suspense>
  );
}
