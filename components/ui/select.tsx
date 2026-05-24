"use client";

import { useState, useRef, useEffect, useCallback } from "react";

import { ChevronDownIcon, CheckIcon } from "@/components/icons";
import { cn } from "@/lib/utils/cn";

type SelectOption<T extends string = string> = {
  value: T;
  label: string;
  description?: string;
};

type SelectProps<T extends string = string> = {
  value: T;
  onChange: (value: T) => void;
  options: ReadonlyArray<SelectOption<T>>;
  disabled?: boolean;
  placeholder?: string;
  id?: string;
};

/**
 * 커스텀 드롭다운 셀렉트.
 * - 클릭으로 열고 닫기
 * - 키보드 접근: Enter/Space 토글, ArrowDown/Up 이동, Escape 닫기
 * - 외부 클릭 시 닫기
 */
export function Select<T extends string = string>({
  value,
  onChange,
  options,
  disabled = false,
  placeholder = "선택",
  id,
}: SelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value);
  const listboxId = id ? `${id}-listbox` : "select-listbox";

  // 외부 클릭 시 닫기
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  function openDropdown() {
    const idx = options.findIndex((o) => o.value === value);
    setFocusedIndex(idx >= 0 ? idx : 0);
    setIsOpen(true);
  }

  const handleSelect = useCallback(
    (optionValue: T) => {
      onChange(optionValue);
      setIsOpen(false);
    },
    [onChange],
  );

  function handleKeyDown(e: React.KeyboardEvent) {
    if (disabled) return;

    switch (e.key) {
      case "Enter":
      case " ": {
        e.preventDefault();
        if (isOpen && focusedIndex >= 0) {
          handleSelect(options[focusedIndex].value);
        } else {
          openDropdown();
        }
        break;
      }
      case "ArrowDown": {
        e.preventDefault();
        if (!isOpen) {
          openDropdown();
        } else {
          setFocusedIndex((prev) =>
            prev < options.length - 1 ? prev + 1 : 0,
          );
        }
        break;
      }
      case "ArrowUp": {
        e.preventDefault();
        if (isOpen) {
          setFocusedIndex((prev) =>
            prev > 0 ? prev - 1 : options.length - 1,
          );
        }
        break;
      }
      case "Escape": {
        e.preventDefault();
        setIsOpen(false);
        break;
      }
    }
  }

  return (
    <div ref={containerRef} className="relative" id={id}>
      {/* 트리거 */}
      <button
        type="button"
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        disabled={disabled}
        onClick={() => (isOpen ? setIsOpen(false) : openDropdown())}
        onKeyDown={handleKeyDown}
        className={cn(
          "flex w-full items-center justify-between h-10 px-3 rounded-lg text-sm",
          "bg-surface-elevated text-fg-primary",
          "border transition-colors outline-none",
          isOpen ? "border-accent" : "border-border-default",
          "disabled:cursor-not-allowed disabled:opacity-50",
        )}
      >
        <span className={selectedOption ? "text-fg-primary" : "text-fg-tertiary"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDownIcon
          width={16}
          height={16}
          className={cn(
            "text-fg-tertiary transition-transform",
            isOpen ? "rotate-180" : "",
          )}
        />
      </button>

      {/* 드롭다운 목록 */}
      {isOpen ? (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 overflow-hidden rounded-lg border border-border-default bg-surface-elevated shadow-xl shadow-black/30"
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            const isFocused = index === focusedIndex;

            return (
              <li
                key={option.value}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(option.value)}
                onMouseEnter={() => setFocusedIndex(index)}
                className={cn(
                  "flex cursor-pointer items-center gap-2 px-3 py-2.5 text-sm transition-colors",
                  isFocused ? "bg-surface-overlay" : "",
                  isSelected ? "text-fg-primary" : "text-fg-secondary",
                )}
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{option.label}</p>
                  {option.description ? (
                    <p className="mt-0.5 text-xs text-fg-tertiary">
                      {option.description}
                    </p>
                  ) : null}
                </div>
                {isSelected ? (
                  <CheckIcon
                    width={16}
                    height={16}
                    className="flex-shrink-0 text-accent"
                  />
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
