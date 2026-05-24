"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { JSONContent } from "@tiptap/react";

import { TiptapEditor } from "@/components/editor/tiptap-editor";
import { Avatar } from "@/components/ui/avatar";
import {
  createCommentApi,
  getCommentsApi,
  type TaskComment,
} from "@/lib/api/task-comment";
import { getAccessToken } from "@/lib/auth/tokens";
import { getSocket } from "@/lib/ws/socket";

import { TabButton } from "./task-detail-atoms";

/** Tiptap JSON 이 비어있는지 (빈 단락만 있는지) 검사. */
function isEmptyJson(value: JSONContent | null): boolean {
  if (!value) return true;
  const content = value.content;
  if (!content || content.length === 0) return true;
  // 단락 1개 + 그 안에 text 가 없으면 empty
  return content.every(
    (node) => !node.content || node.content.length === 0,
  );
}

type TaskConversationProps = {
  taskId: string;
};

/**
 * Task 상세 우측 패인의 Conversation 탭.
 *
 * - 마운트/taskId 변경 시 BE 에서 코멘트 로드 (getCommentsApi)
 * - 입력 후 submit 시 createCommentApi 호출
 * - socket comment.created/updated/deleted 구독 → 다른 사용자의 변경 즉시 반영
 *
 * 본인 코멘트 수정/삭제 UI 는 후속 페이즈 (Tiptap 도입과 함께).
 * Activity 로그 표시도 후속 (BE ActivityService 에 task 단위 list 추가 필요).
 */
export function TaskConversation({ taskId }: TaskConversationProps) {
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [draft, setDraft] = useState<JSONContent | null>(null);
  // 입력 영역 reset 을 위한 key (값 변경 시 TiptapEditor 강제 remount)
  const editorKeyRef = useRef(0);
  const [editorKey, setEditorKey] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // 코멘트 로드
  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;
    let cancelled = false;
    getCommentsApi(token, taskId)
      .then((data) => {
        if (!cancelled) setComments(data);
      })
      .catch(() => {
        if (!cancelled) setComments([]);
      });
    return () => {
      cancelled = true;
    };
  }, [taskId]);

  // 실시간 동기화 — board-view 에서 project room 에 이미 join 되어 있다고 가정.
  // 같은 socket 으로 comment.* 이벤트를 추가 listener.
  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;
    const socket = getSocket(token);

    function onCreated({ comment }: { comment: TaskComment }) {
      if (comment.taskId !== taskId) return;
      setComments((prev) =>
        prev.some((c) => c.id === comment.id) ? prev : [...prev, comment],
      );
    }
    function onUpdated({ comment }: { comment: TaskComment }) {
      if (comment.taskId !== taskId) return;
      setComments((prev) => prev.map((c) => (c.id === comment.id ? comment : c)));
    }
    function onDeleted({ commentId, taskId: t }: { commentId: string; taskId: string }) {
      if (t !== taskId) return;
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    }

    socket.on("comment.created", onCreated);
    socket.on("comment.updated", onUpdated);
    socket.on("comment.deleted", onDeleted);
    return () => {
      socket.off("comment.created", onCreated);
      socket.off("comment.updated", onUpdated);
      socket.off("comment.deleted", onDeleted);
    };
  }, [taskId]);

  const submit = useCallback(async () => {
    if (isEmptyJson(draft) || submitting) return;
    const token = getAccessToken();
    if (!token) return;
    setSubmitting(true);
    try {
      const created = await createCommentApi(token, taskId, draft);
      // 자기 자신은 응답으로 즉시 추가. socket echo 는 dedup 으로 무시됨.
      setComments((prev) =>
        prev.some((c) => c.id === created.id) ? prev : [...prev, created],
      );
      // 입력 영역 reset — editor key 변경으로 강제 remount
      setDraft(null);
      editorKeyRef.current += 1;
      setEditorKey(editorKeyRef.current);
    } catch {
      // 실패 시 draft 유지
    } finally {
      setSubmitting(false);
    }
  }, [draft, submitting, taskId]);

  return (
    <>
      <nav
        role="tablist"
        aria-label="상세 탭"
        className="flex items-center gap-4 border-b border-border-subtle px-5"
      >
        <TabButton active>
          Conversation
          <span className="ml-1.5 text-xs text-fg-tertiary">{comments.length}</span>
        </TabButton>
        <TabButton>Description</TabButton>
        <TabButton>Sub-tasks</TabButton>
        <TabButton>Activity</TabButton>
      </nav>

      <ul className="space-y-4 px-5 py-4">
        {comments.length === 0 ? (
          <li className="text-center text-xs text-fg-tertiary">
            아직 코멘트가 없어요. 첫 코멘트를 남겨보세요.
          </li>
        ) : (
          comments.map((c) => <CommentItem key={c.id} comment={c} />)
        )}
      </ul>

      <div className="border-t border-border-subtle px-5 py-3">
        <div
          className="rounded-md border border-border-subtle bg-surface-base px-3 py-2 focus-within:border-accent focus-within:ring-1 focus-within:ring-accent"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              void submit();
            }
          }}
        >
          <TiptapEditor
            key={editorKey}
            value={draft}
            placeholder="코멘트 작성… (Ctrl/⌘ + Enter 로 전송)"
            onChange={(json) => setDraft(json)}
          />
        </div>
        <div className="mt-2 flex justify-end">
          <button
            type="button"
            onClick={() => void submit()}
            disabled={isEmptyJson(draft) || submitting}
            className="rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white hover:bg-accent-hover disabled:opacity-50"
          >
            {submitting ? "보내는 중…" : "보내기"}
          </button>
        </div>
      </div>
    </>
  );
}

// ── 내부: 단일 코멘트 ────────────────────────────────────────────────

function CommentItem({ comment }: { comment: TaskComment }) {
  return (
    <li className="flex items-start gap-3">
      <Avatar
        initials={comment.author.name.slice(0, 2).toUpperCase()}
        color="blue"
        size="sm"
        name={comment.author.name}
      />
      <div className="min-w-0 flex-1">
        <header className="flex items-baseline gap-2">
          <span className="text-sm font-semibold text-fg-primary">
            {comment.author.name}
          </span>
          <time className="font-mono text-[11px] text-fg-tertiary">
            {new Date(comment.createdAt).toLocaleString("ko-KR", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </time>
        </header>
        <div className="mt-0.5 break-words text-sm leading-relaxed text-fg-primary">
          <TiptapEditor
            value={comment.content as JSONContent | string | null}
            editable={false}
          />
        </div>
      </div>
    </li>
  );
}
