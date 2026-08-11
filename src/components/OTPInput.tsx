import { useEffect, useRef, useState } from 'react';

interface Props {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  /** Set by the parent after a verify attempt: 'error' shakes+reds, 'success' greens. */
  status?: 'idle' | 'error' | 'success';
  disabled?: boolean;
}

export const OTPInput = ({ length = 6, value, onChange, status = 'idle', disabled }: Props) => {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const [focusedIdx, setFocusedIdx] = useState<number | null>(null);
  const chars = value.split('').slice(0, length);

  // When an error/success status comes in, briefly show it then let the
  // parent reset it back to 'idle' (typically after clearing the value).
  const [shake, setShake] = useState(false);
  useEffect(() => {
    if (status === 'error') {
      setShake(true);
      const t = setTimeout(() => setShake(false), 400);
      return () => clearTimeout(t);
    }
  }, [status]);

  const setDigit = (idx: number, digit: string) => {
    const next = chars.slice();
    next[idx] = digit;
    const joined = next.join('').slice(0, length);
    onChange(joined);
  };

  const handleChange = (idx: number, raw: string) => {
    const digit = raw.replace(/\D/g, '').slice(-1);
    if (!digit) {
      setDigit(idx, '');
      return;
    }
    setDigit(idx, digit);
    if (idx < length - 1) inputsRef.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (chars[idx]) {
        setDigit(idx, '');
      } else if (idx > 0) {
        inputsRef.current[idx - 1]?.focus();
        setDigit(idx - 1, '');
      }
    } else if (e.key === 'ArrowLeft' && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    } else if (e.key === 'ArrowRight' && idx < length - 1) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pasted) return;
    onChange(pasted);
    const nextIdx = Math.min(pasted.length, length - 1);
    inputsRef.current[nextIdx]?.focus();
  };

  const boxColor = (idx: number) => {
    if (status === 'success') return 'border-green-500 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400';
    if (status === 'error') return 'border-red-500 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400';
    if (focusedIdx === idx) return 'border-black dark:border-white bg-white dark:bg-neutral-900';
    if (chars[idx]) return 'border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900';
    return 'border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800';
  };

  return (
    <div className={`flex justify-center gap-2 ${shake ? 'animate-shake' : ''}`}>
      {Array.from({ length }).map((_, idx) => (
        <input
          key={idx}
          ref={(el) => { inputsRef.current[idx] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          disabled={disabled}
          value={chars[idx] || ''}
          onChange={(e) => handleChange(idx, e.target.value)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          onPaste={handlePaste}
          onFocus={() => setFocusedIdx(idx)}
          onBlur={() => setFocusedIdx(null)}
          className={`w-10 h-12 md:w-11 md:h-13 text-center text-lg font-bold rounded-xl border-2 outline-none transition-colors duration-150 text-black dark:text-white disabled:opacity-50 ${boxColor(idx)}`}
        />
      ))}
    </div>
  );
};
