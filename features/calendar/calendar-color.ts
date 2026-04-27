/**
 * 이벤트 `color` 문자열 → Tailwind 클래스 매핑.
 *
 * BE 는 `color` 를 자유 문자열로 통과시키므로, FE 가 알려진 토큰만 색을 입히고
 * 그 외에는 fallback (accent) 으로 처리한다.
 *
 * 매핑 키는 디자인 토큰 이름과 일치 (`--color-accent`, `--color-priority-p1` 등).
 */
type ColorToken = "accent" | "priority-p1" | "priority-p2" | "priority-p3";

const COLOR_TOKENS: ReadonlySet<ColorToken> = new Set<ColorToken>([
  "accent",
  "priority-p1",
  "priority-p2",
  "priority-p3",
]);

/** 셀 안에 표시되는 작은 이벤트 pill 의 배경·텍스트 클래스. */
const PILL_CLASSES: Record<ColorToken, string> = {
  accent: "bg-accent/15 text-accent",
  "priority-p1": "bg-priority-p1/15 text-priority-p1",
  "priority-p2": "bg-priority-p2/15 text-priority-p2",
  "priority-p3": "bg-priority-p3/15 text-priority-p3",
};

/** 좌측 색 인디케이터 (얇은 막대) 배경. */
const STRIPE_CLASSES: Record<ColorToken, string> = {
  accent: "bg-accent",
  "priority-p1": "bg-priority-p1",
  "priority-p2": "bg-priority-p2",
  "priority-p3": "bg-priority-p3",
};

function resolveToken(color: string | null | undefined): ColorToken {
  if (color && (COLOR_TOKENS as ReadonlySet<string>).has(color)) {
    return color as ColorToken;
  }
  return "accent";
}

export function getEventPillClass(color: string | null | undefined): string {
  return PILL_CLASSES[resolveToken(color)];
}

export function getEventStripeClass(color: string | null | undefined): string {
  return STRIPE_CLASSES[resolveToken(color)];
}
