import type { TaskActivity, TaskComment, TaskId } from "@/types/domain";

/**
 * Task 상세 페인의 Conversation 탭에 쓰이는 mock.
 * - Activity: 상태 전이 등 자동 생성 엔트리
 * - Comment: 사람이 작성한 본문
 *
 * 렌더는 합쳐서 시간순으로 표시.
 */

export const TASK_ACTIVITIES: ReadonlyArray<TaskActivity> = [
  {
    id: "act-142-1",
    taskId: "NX-142",
    actorId: "u-minho",
    description: "moved this task from To do → In progress",
    timeLabel: "Yesterday 4:14 PM",
  },
];

export const TASK_COMMENTS: ReadonlyArray<TaskComment> = [
  {
    id: "cmt-142-1",
    taskId: "NX-142",
    authorId: "u-sora",
    body: "히어로 복사본은 feature-first로 가고, scroll 시 video가 플레이되는 쪽으로 실험해볼게요.",
    timeLabel: "Yesterday 4:21 PM",
  },
  {
    id: "cmt-142-2",
    taskId: "NX-142",
    authorId: "u-hana",
    body: "빈 상태 일러스트 3종 스타일 스케치 올려둘게요. 채도 낮춘 버전 포함.",
    timeLabel: "Today 9:12 AM",
  },
  {
    id: "cmt-142-3",
    taskId: "NX-142",
    authorId: "u-sejun",
    body: "PR 올리면 우선순위로 리뷰하겠습니다.",
    timeLabel: "Today 10:20 AM",
  },
];

export function getTaskActivities(taskId: TaskId): ReadonlyArray<TaskActivity> {
  return TASK_ACTIVITIES.filter((a) => a.taskId === taskId);
}

export function getTaskComments(taskId: TaskId): ReadonlyArray<TaskComment> {
  return TASK_COMMENTS.filter((c) => c.taskId === taskId);
}
