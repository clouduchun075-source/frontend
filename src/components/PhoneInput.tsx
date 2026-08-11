import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface Country {
  name: string;
  dial: string;
  /** Groups of digits after the dial code, e.g. [2,3,2,2] -> "90 123 45 67" */
  groups: number[];
}

// Ordered so the most likely choices sit at the top.
export const COUNTRIES: Country[] = [
  { name: 'Uzbekistan', dial: '+998', groups: [2, 3, 2, 2] },
  { name: 'Kazakhstan', dial: '+7', groups: [3, 3, 2, 2] },
  { name: 'Russia', dial: '+7', groups: [3, 3, 2, 2] },
  { name: 'Kyrgyzstan', dial: '+996', groups: [3, 3, 3] },
  { name: 'Tajikistan', dial: '+992', groups: [2, 3, 4] },
  { name: 'Turkmenistan', dial: '+993', groups: [2, 6] },
  { name: 'Turkey', dial: '+90', groups: [3, 3, 2, 2] },
  { name: 'United States', dial: '+1', groups: [3, 3, 4] },
  { name: 'United Kingdom', dial: '+44', groups: [4, 6] },
  { name: 'Germany', dial: '+49', groups: [3, 8] },
  { name: 'United Arab Emirates', dial: '+971', groups: [2, 3, 4] },
  { name: 'South Korea', dial: '+82', groups: [2, 4, 4] },
  { name: 'China', dial: '+86', groups: [3, 4, 4] },
  { name: 'India', dial: '+91', groups: [5, 5] },
];

const totalDigits = (c: Country) => c.groups.reduce((a, b) => a + b, 0);

/** Renders "90 123 45 67" as the user types, with "_" for the remaining slots. */
function buildMask(digits: string, groups: number[]) {
  const chars = digits.split('');
  let i = 0;
  return groups
    .map(size => {
      let group = '';
      for (let n = 0; n < size; n++) {
        group += i < chars.length ? chars[i] : '_';
        i++;
      }
      return group;
    })
    .join(' ');
}

interface Props {
  /** Full E.164 number, e.g. "+998901234567" */
  value: string;
  onChange: (fullNumber: string) => void;
}

export const PhoneInput = ({ value, onChange }: Props) => {
  const [country, setCountry] = useState<Country>(COUNTRIES[0]);
  const [digits, setDigits] = useState('');
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const max = totalDigits(country);

  // Close the dropdown when clicking outside of it
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  // Keep the parent's value in sync
  useEffect(() => {
    onChange(digits ? `${country.dial}${digits}` : '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country, digits]);

  // Trim digits if the newly selected country allows fewer of them
  const selectCountry = (c: Country) => {
    setCountry(c);
    setDigits(d => d.slice(0, totalDigits(c)));
    setOpen(false);
    inputRef.current?.focus();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const onlyDigits = e.target.value.replace(/\D/g, '').slice(0, max);
    setDigits(onlyDigits);
  };

  const filled = digits.length;

  return (
    <div ref={wrapRef} className="relative">
      <div
        className={`flex items-center bg-neutral-50 dark:bg-neutral-800 border rounded-full transition-colors ${
          open ? 'border-black dark:border-white' : 'border-neutral-200 dark:border-neutral-700'
        }`}
      >
        {/* Country / dial code selector */}
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className="flex items-center gap-1 pl-5 pr-3 py-3.5 text-sm font-bold text-black dark:text-white focus:outline-none"
        >
          {country.dial}
          <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        <div className="w-px h-5 bg-neutral-200 dark:bg-neutral-700" />

        {/* Masked number field */}
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="tel"
            inputMode="numeric"
            value={digits}
            onChange={handleChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className="absolute inset-0 w-full h-full bg-transparent px-4 text-sm text-transparent caret-transparent focus:outline-none"
            aria-label="Phone number"
          />
          <div className="px-4 py-3.5 text-sm tracking-[0.15em] font-medium pointer-events-none select-none whitespace-pre">
            {(() => {
              const mask = buildMask(digits, country.groups);
              // Everything up to (and including) the last typed digit is "filled"
              let seen = 0;
              let splitAt = mask.length;
              for (let i = 0; i < mask.length; i++) {
                if (mask[i] === '_') { splitAt = i; break; }
                if (mask[i] !== ' ') seen++;
                if (seen === digits.length) { splitAt = i + 1; break; }
              }
              return (
                <>
                  <span className="text-black dark:text-white">{mask.slice(0, splitAt)}</span>
                  {focused && digits.length < max && (
                    <span className="inline-block w-px h-4 -mb-0.5 bg-black dark:bg-white animate-pulse" />
                  )}
                  <span className="text-neutral-300 dark:text-neutral-600">{mask.slice(splitAt)}</span>
                </>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Helper: how many digits are still needed */}
      <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-1.5 ml-5">
        {filled === max ? 'Looks good' : `${filled}/${max} digits`}
      </p>

      {/* Country dropdown */}
      {open && (
        <div className="absolute z-20 top-full left-0 mt-2 w-full max-h-56 overflow-y-auto bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow-xl py-1">
          {COUNTRIES.map((c, i) => {
            const active = c.name === country.name;
            return (
              <button
                key={`${c.name}-${i}`}
                type="button"
                onClick={() => selectCountry(c)}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-left text-xs transition-colors ${
                  active
                    ? 'bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white font-bold'
                    : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                }`}
              >
                <span>{c.name}</span>
                <span className="flex items-center gap-2 text-neutral-400 font-semibold">
                  {c.dial}
                  {active && <Check className="w-3.5 h-3.5 text-black dark:text-white" />}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
