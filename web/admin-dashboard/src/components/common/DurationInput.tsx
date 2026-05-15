// src/components/inputs/DurationInput.tsx

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";

type DurationInputProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
};

function digitsFromDuration(value: string) {
  return value.replace(/\D/g, "").replace(/^0+/, "").slice(0, 6);
}

function formatDurationFromDigits(digits: string) {
  if (digits.length === 0) return "";

  const padded = digits.slice(0, 6).padStart(6, "0");

  return `${padded.slice(0, 2)}:${padded.slice(2, 4)}:${padded.slice(4, 6)}`;
}

export function DurationInput({
  id,
  value,
  onChange,
  placeholder = "HH:MM:SS",
  disabled = false,
}: DurationInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [digits, setDigits] = useState(() => digitsFromDuration(value));

  useEffect(() => {
    setDigits(digitsFromDuration(value));
  }, [value]);

  const displayValue = formatDurationFromDigits(digits);

  function moveCursorToEnd() {
    requestAnimationFrame(() => {
      const input = inputRef.current;
      if (!input) return;

      const end = input.value.length;

      input.focus();
      input.setSelectionRange(end, end);
    });
  }

  function updateDigits(nextDigits: string) {
    const cleanDigits = nextDigits.replace(/\D/g, "").slice(0, 6);

    setDigits(cleanDigits);
    onChange(formatDurationFromDigits(cleanDigits));
    moveCursorToEnd();
  }

  return (
    <Input
      ref={inputRef}
      id={id}
      value={displayValue}
      placeholder={placeholder}
      disabled={disabled}
      inputMode='numeric'
      className='tabular-nums'
      onFocus={moveCursorToEnd}
      onClick={moveCursorToEnd}
      onMouseUp={(e) => {
        e.preventDefault();
        moveCursorToEnd();
      }}
      onKeyDown={(e) => {
        if (/^\d$/.test(e.key)) {
          e.preventDefault();
          updateDigits(digits + e.key);
          return;
        }

        if (e.key === "Backspace") {
          e.preventDefault();
          updateDigits(digits.slice(0, -1));
          return;
        }

        if (e.key === "Delete") {
          e.preventDefault();
          updateDigits("");
          return;
        }
      }}
      onChange={() => {
        // handled by onKeyDown
      }}
    />
  );
}
