import { cn } from "@/lib/utils/cn";

type StepIndicatorProps = {
  currentStep: number;
  totalSteps: number;
};

const STEP_LABELS = ["프로필", "워크스페이스"] as const;

/**
 * 온보딩 스텝 진행 인디케이터.
 * 번호 + 라벨 + 연결선으로 진행 상태를 시각적으로 표현.
 */
export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div
      className="flex items-center gap-0"
      role="progressbar"
      aria-valuenow={currentStep}
      aria-valuemin={1}
      aria-valuemax={totalSteps}
      aria-label={`${totalSteps}단계 중 ${currentStep}단계`}
    >
      {Array.from({ length: totalSteps }, (_, i) => {
        const step = i + 1;
        const isActive = step === currentStep;
        const isCompleted = step < currentStep;
        const isLast = step === totalSteps;

        return (
          <div key={step} className="flex items-center">
            {/* 스텝 원형 + 라벨 */}
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "flex size-7 items-center justify-center rounded-full text-xs font-semibold transition-all duration-300",
                  isActive
                    ? "bg-accent text-white shadow-[0_0_12px_rgba(79,140,255,0.4)]"
                    : "",
                  isCompleted ? "bg-accent/20 text-accent" : "",
                  !isActive && !isCompleted
                    ? "bg-surface-elevated text-fg-tertiary"
                    : "",
                )}
              >
                {isCompleted ? (
                  <svg
                    className="size-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  step
                )}
              </span>
              <span
                className={cn(
                  "text-xs font-medium transition-colors",
                  isActive ? "text-fg-primary" : "",
                  isCompleted ? "text-accent" : "",
                  !isActive && !isCompleted ? "text-fg-tertiary" : "",
                )}
              >
                {STEP_LABELS[i]}
              </span>
            </div>

            {/* 연결선 */}
            {!isLast ? (
              <div
                className={cn(
                  "mx-3 h-px w-10 transition-colors duration-300",
                  isCompleted ? "bg-accent/40" : "bg-border-default",
                )}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
