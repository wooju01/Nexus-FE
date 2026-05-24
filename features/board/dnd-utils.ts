/**
 * 보드 드래그앤드롭 보조 유틸.
 *
 * `Task.order` 는 같은 컬럼 안의 표시 순서를 결정하는 정수/소수.
 * 카드 사이에 끼워넣을 때마다 전체 재정렬을 피하기 위해,
 * 앞/뒤 카드의 order **중간값** 을 사용한다.
 *
 * 중간값을 계속 쪼개다 보면 소수 정밀도 누적 문제가 생길 수 있는데,
 * 이는 별도의 주기적 rebalance 작업으로 해결 (추후 NX-task).
 */

import type { Task } from "@/lib/api/task";

/** order 값이 양 끝에 추가될 때 쓰는 기본 간격. */
const ORDER_STEP = 1000;

/**
 * 앞/뒤 카드의 order 로부터 새 order 를 계산한다.
 *
 * - 양쪽 모두 비어있음(빈 컬럼) → ORDER_STEP
 * - 맨 위로 삽입 (앞이 없음) → next - ORDER_STEP
 * - 맨 아래로 삽입 (뒤가 없음) → prev + ORDER_STEP
 * - 중간 삽입 → (prev + next) / 2
 */
export function calculateOrder(
  prev: number | null,
  next: number | null,
): number {
  if (prev === null && next === null) return ORDER_STEP;
  if (prev === null) return (next as number) - ORDER_STEP;
  if (next === null) return prev + ORDER_STEP;
  return (prev + next) / 2;
}

/**
 * `tasks` 에서 같은 status 인 카드들만 order 오름차순으로 추출.
 * 보드 컬럼 내 표시 순서와 동일.
 */
export function sortedColumnTasks(
  tasks: ReadonlyArray<Task>,
  status: Task["status"],
): Task[] {
  return tasks
    .filter((t) => t.status === status)
    .slice()
    .sort((a, b) => a.order - b.order);
}

/**
 * `overTaskId` 위치에 삽입할 때의 새 order 를 계산한다.
 *
 * - `position: "before"` 면 overTask 의 앞 카드와 overTask 사이
 * - `position: "after"`  면 overTask 와 그 뒤 카드 사이
 */
export function orderForInsert(
  columnTasks: ReadonlyArray<Task>,
  overTaskId: string,
  position: "before" | "after",
  excludeId?: string,
): number {
  const filtered = excludeId
    ? columnTasks.filter((t) => t.id !== excludeId)
    : columnTasks;
  const overIndex = filtered.findIndex((t) => t.id === overTaskId);

  if (overIndex === -1) {
    // 못 찾으면 맨 뒤로
    const last = filtered[filtered.length - 1];
    return calculateOrder(last?.order ?? null, null);
  }

  if (position === "before") {
    const prev = filtered[overIndex - 1] ?? null;
    const over = filtered[overIndex];
    return calculateOrder(prev?.order ?? null, over.order);
  }

  const over = filtered[overIndex];
  const next = filtered[overIndex + 1] ?? null;
  return calculateOrder(over.order, next?.order ?? null);
}
