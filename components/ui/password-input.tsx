"use client";

import type { InputHTMLAttributes } from "react";
import { forwardRef, useState } from "react";

import { EyeIcon, EyeOffIcon } from "@/components/icons";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";

/**
 * 비밀번호 전용 입력 — 오른쪽 끝에 눈 아이콘 토글 버튼.
 *
 * 동작:
 * - 기본은 `type="password"` (가리기 상태) + EyeOffIcon.
 * - 버튼 클릭 시 `type="text"`로 전환 + EyeIcon.
 * - 아이콘 색상과 hover 상태는 폼 전역의 fg 토큰을 따른다.
 *
 * 접근성:
 * - 토글 버튼은 `aria-pressed`로 현재 가시성 상태를 노출.
 * - `aria-label`은 다음 동작을 말하도록 ("비밀번호 보기" / "비밀번호 숨기기").
 * - 버튼은 `tabIndex={-1}`로 Tab 순서에서 제외 — 비밀번호 매니저/폼 흐름을 방해하지 않기 위함.
 *   (원한다면 Shift+클릭이나 마우스로 접근 가능. 키보드 유저를 완전히 배제하지는 않음: Space/Enter는 버튼이 포커스됐을 때만.)
 *
 * 주의: type 속성은 이 컴포넌트가 관리하므로 호출측에서 지정해도 무시된다.
 */
type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  hasError?: boolean;
};

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput({ hasError, className, ...rest }, ref) {
    const [isVisible, setIsVisible] = useState(false);

    const toggle = () => setIsVisible((prev) => !prev);

    return (
      <div className="relative">
        <Input
          ref={ref}
          type={isVisible ? "text" : "password"}
          hasError={hasError}
          // 아이콘 버튼(size-8)이 오른쪽에 겹치지 않도록 여유 공간 확보.
          className={cn("pr-10", className)}
          {...rest}
        />
        <button
          type="button"
          onClick={toggle}
          tabIndex={-1}
          aria-pressed={isVisible}
          aria-label={isVisible ? "비밀번호 숨기기" : "비밀번호 보기"}
          title={isVisible ? "비밀번호 숨기기" : "비밀번호 보기"}
          className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-fg-tertiary transition-colors hover:text-fg-primary"
        >
          {isVisible ? (
            <EyeIcon className="size-4" aria-hidden="true" />
          ) : (
            <EyeOffIcon className="size-4" aria-hidden="true" />
          )}
        </button>
      </div>
    );
  },
);
