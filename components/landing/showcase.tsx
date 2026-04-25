import { ShowcaseChat } from "@/components/landing/showcase-chat";
import { ShowcaseBoard } from "@/components/landing/showcase-board";
import { ShowcaseInbox } from "@/components/landing/showcase-inbox";
import { ShowcaseAI } from "@/components/landing/showcase-ai";
import { CheckIcon } from "@/components/icons";

/**
 * 쇼케이스 섹션 — 주요 기능 4개를 좌우 교차 레이아웃으로 보여준다.
 * 각 목업은 독립 컴포넌트이므로 나중에 실제 스크린샷 이미지로 교체 가능.
 */

type ShowcaseItem = {
  tag: string;
  title: string;
  description: string;
  points: ReadonlyArray<string>;
  visual: React.ReactNode;
  reverse: boolean;
};

const SHOWCASE_ITEMS: ReadonlyArray<ShowcaseItem> = [
  {
    tag: "Context Preservation",
    title: "대화가 곧 작업의 맥락이 됩니다",
    description:
      "채널의 메시지가 자연스럽게 Task·Project로 연결됩니다. 스레드에서 이어진 논의가 의사결정의 근거로 함께 남아요.",
    points: [
      "Public·Private 채널과 답글 스레드",
      "메시지에서 바로 Task 생성",
      "이모지 리액션과 파일 공유",
    ],
    visual: <ShowcaseChat />,
    reverse: false,
  },
  {
    tag: "Single Home for Work",
    title: "하나의 보드에서 모든 작업을 관리하세요",
    description:
      "Board·Table·Timeline·Calendar — 4가지 뷰로 프로젝트를 한눈에. WIP 카운터와 라벨로 진행 상황을 즉시 파악합니다.",
    points: [
      "칸반 드래그 앤 드롭",
      "우선순위·라벨·담당자 필터링",
      "채널 ↔ 보드 자동 연결",
    ],
    visual: <ShowcaseBoard />,
    reverse: true,
  },
  {
    tag: "Never Miss What Matters",
    title: "멘션·답글·승인을 하나의 인박스로",
    description:
      "워크스페이스의 모든 알림이 한곳에 모입니다. 읽음 처리와 출처 링크로 맥락을 잃지 않고 빠르게 대응하세요.",
    points: [
      "멘션·스레드·태스크 배정 통합",
      "승인 요청 인라인 처리",
      "안 읽은 메시지 요약",
    ],
    visual: <ShowcaseInbox />,
    reverse: false,
  },
  {
    tag: "AI-native Workflow",
    title: "AI가 맥락을 정리해드립니다",
    description:
      "Daily digest가 하루를 요약하고, 긴 스레드를 한 문단으로 압축합니다. 워크플로우에 내장된 AI로 팀의 속도를 높이세요.",
    points: [
      "채널별 하이라이트 자동 요약",
      "태스크 상태 변경 알림",
      "스레드 원클릭 요약",
    ],
    visual: <ShowcaseAI />,
    reverse: true,
  },
];

export function LandingShowcase() {
  return (
    <section id="showcase" className="border-t border-border-subtle py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-20 max-w-2xl">
          <p className="mb-3 text-sm font-medium uppercase tracking-wider text-accent">
            제품 둘러보기
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-fg-primary sm:text-4xl">
            맥락을 잃지 않는 협업,
            <br />
            팀의 속도를 되찾는 설계.
          </h2>
        </div>

        <div className="flex flex-col gap-32">
          {SHOWCASE_ITEMS.map((item) => (
            <div
              key={item.tag}
              className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2"
            >
              {/* 텍스트 */}
              <div className={item.reverse ? "lg:order-2" : undefined}>
                <p className="mb-3 text-sm font-medium uppercase tracking-wider text-accent">
                  {item.tag}
                </p>
                <h3 className="mb-4 text-2xl font-semibold tracking-tight text-fg-primary">
                  {item.title}
                </h3>
                <p className="mb-6 text-base leading-7 text-fg-secondary">
                  {item.description}
                </p>
                <ul className="space-y-2">
                  {item.points.map((point) => (
                    <li
                      key={point}
                      className="flex items-center gap-2 text-sm text-fg-secondary"
                    >
                      <CheckIcon
                        width={16}
                        height={16}
                        className="flex-shrink-0 text-accent"
                      />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>

              {/* 비주얼 목업 */}
              <div className={item.reverse ? "lg:order-1" : undefined}>
                {item.visual}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
