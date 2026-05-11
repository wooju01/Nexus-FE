"use client";

import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

type ConfirmDialogProps = {
  isOpen: boolean;
  /** 사용자가 취소(또는 ESC/배경 클릭) 했을 때. 로딩 중일 땐 호출되지 않도록 상위에서 isLoading 처리. */
  onCancel: () => void;
  /** 사용자가 확인을 눌렀을 때. 비동기 작업이면 Promise 반환. */
  onConfirm: () => Promise<void> | void;
  title: string;
  /** 본문 설명 — 한 줄 정도의 짧은 안내. */
  description?: string;
  /** 확인 버튼 텍스트. 기본 "확인". */
  confirmLabel?: string;
  /** 취소 버튼 텍스트. 기본 "취소". */
  cancelLabel?: string;
  /** true 면 확인 버튼이 위험 색(red) 변형. 삭제/해지 같은 비가역 액션 용. */
  danger?: boolean;
  /** true 면 확인 중 — 두 버튼 disabled, 확인 버튼 스피너 표시. */
  isLoading?: boolean;
};

/**
 * 단순 확인 다이얼로그.
 *
 * `window.confirm` 의 대체 — 디자인 시스템 토큰 (background, danger color 등) 적용 가능.
 * Modal 컴포넌트 위에 두 버튼만 얹은 얇은 래퍼.
 *
 * 사용 예:
 *   <ConfirmDialog
 *     isOpen={open}
 *     title='이벤트를 삭제할까요?'
 *     description='이 작업은 되돌릴 수 없습니다.'
 *     confirmLabel='삭제'
 *     danger
 *     isLoading={isDeleting}
 *     onCancel={() => setOpen(false)}
 *     onConfirm={async () => { await deleteEvent(); setOpen(false); }}
 *   />
 */
export function ConfirmDialog({
  isOpen,
  onCancel,
  onConfirm,
  title,
  description,
  confirmLabel = "확인",
  cancelLabel = "취소",
  danger = false,
  isLoading = false,
}: ConfirmDialogProps) {
  function handleCancel() {
    if (isLoading) return;
    onCancel();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} title={title}>
      {description ? (
        <p className="text-sm leading-6 text-fg-secondary">{description}</p>
      ) : null}

      <div className="mt-5 flex justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleCancel}
          disabled={isLoading}
        >
          {cancelLabel}
        </Button>
        <Button
          type="button"
          variant={danger ? "danger" : "primary"}
          size="sm"
          onClick={() => {
            void onConfirm();
          }}
          isLoading={isLoading}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
