import { Fragment } from "react";

import { getUser } from "@/lib/mocks/users";

/**
 * 메시지 본문의 @멘션을 accent 하이라이트로 치환해서 렌더.
 * - 정확히 `@word` (영문/숫자/언더스코어) 패턴만 매칭.
 * - 멘션 대상 사용자가 없어도 하이라이트는 하되 툴팁만 비움.
 */
const MENTION_PATTERN = /@([a-zA-Z0-9_]+)/g;

type MessageBodyProps = {
  body: string;
  className?: string;
};

type Segment =
  | { kind: "text"; value: string }
  | { kind: "mention"; handle: string };

function parse(body: string): ReadonlyArray<Segment> {
  const segments: Segment[] = [];
  let lastIndex = 0;

  for (const match of body.matchAll(MENTION_PATTERN)) {
    const start = match.index ?? 0;
    if (start > lastIndex) {
      segments.push({ kind: "text", value: body.slice(lastIndex, start) });
    }
    segments.push({ kind: "mention", handle: match[1] ?? "" });
    lastIndex = start + match[0].length;
  }

  if (lastIndex < body.length) {
    segments.push({ kind: "text", value: body.slice(lastIndex) });
  }

  return segments;
}

export function MessageBody({ body, className }: MessageBodyProps) {
  const segments = parse(body);

  return (
    <p
      className={
        className ??
        "whitespace-pre-wrap break-words text-sm leading-relaxed text-fg-primary"
      }
    >
      {segments.map((seg, i) => {
        if (seg.kind === "text") {
          return <Fragment key={i}>{seg.value}</Fragment>;
        }
        // 멘션 lookup은 `u-<handle>` 컨벤션 가정.
        const user = getUser(`u-${seg.handle}`);
        return (
          <span
            key={i}
            title={user?.name}
            className="rounded bg-accent/15 px-1 text-accent"
          >
            @{seg.handle}
          </span>
        );
      })}
    </p>
  );
}
