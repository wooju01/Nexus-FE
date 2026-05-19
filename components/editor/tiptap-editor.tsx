"use client";

import { useEditor, EditorContent, type JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect } from "react";

import { cn } from "@/lib/utils/cn";

type TiptapEditorProps = {
  /** Tiptap JSON 또는 null. string 도 호환 (legacy plain text). */
  value: JSONContent | string | null;
  onChange?: (value: JSONContent) => void;
  editable?: boolean;
  placeholder?: string;
  className?: string;
  /** 포커스 잃을 때 1회 발화. 자동저장에 활용. */
  onBlur?: (value: JSONContent) => void;
};

/**
 * 단순 Tiptap 에디터. StarterKit + Placeholder.
 *
 * - 동적 import 대상 (next/dynamic ssr:false) — 직접 import 보다는
 *   `dynamic(() => import("@/components/editor/tiptap-editor"), { ssr: false })` 권장.
 * - readonly 모드 지원 (editable=false).
 * - JSON 우선, 문자열 값은 plain text 로 초기화.
 */
export function TiptapEditor({
  value,
  onChange,
  onBlur,
  editable = true,
  placeholder,
  className,
}: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      ...(placeholder ? [Placeholder.configure({ placeholder })] : []),
    ],
    content: normalizeContent(value),
    editable,
    immediatelyRender: false,
    onUpdate({ editor }) {
      onChange?.(editor.getJSON());
    },
    onBlur({ editor }) {
      onBlur?.(editor.getJSON());
    },
  });

  // editable prop 변경 동기화
  useEffect(() => {
    editor?.setEditable(editable);
  }, [editor, editable]);

  if (!editor) return null;

  return (
    <EditorContent
      editor={editor}
      className={cn(
        "tiptap min-h-[60px] rounded-md text-sm leading-relaxed text-fg-primary focus-within:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-fg-tertiary [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]",
        className,
      )}
    />
  );
}

function normalizeContent(
  value: JSONContent | string | null,
): JSONContent | string | null {
  if (value == null) return null;
  if (typeof value === "string") return value;
  return value;
}
