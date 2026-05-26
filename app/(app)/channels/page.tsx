import { MessagesIcon } from "@/components/icons";

/**
 * /channels 랜딩 페이지
 * Messages Rail 클릭 시 진입하는 페이지.
 * 왼쪽 Sidebar에서 채널을 선택하면 /channels/[id]로 이동.
 */
export default function ChannelsPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-surface-elevated text-fg-tertiary">
        <MessagesIcon className="size-8" />
      </div>
      <div>
        <p className="text-base font-semibold text-fg-primary">채널을 선택하세요</p>
        <p className="mt-1 text-sm text-fg-tertiary">
          왼쪽에서 채널이나 DM을 선택해 대화를 시작하세요.
        </p>
      </div>
    </div>
  );
}
