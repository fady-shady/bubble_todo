import { useLayoutEffect, useRef, useState } from 'react';
import type { Urgency } from '../../types';

interface Props {
  value: Urgency;
  onChange: (u: Urgency) => void;
}

const OPTIONS = [
  { label: 'Low',    val: 1 as Urgency },
  { label: 'Medium', val: 2 as Urgency },
  { label: 'High',   val: 3 as Urgency },
];

export function UrgencySelector({ value, onChange }: Props) {
  const activeIdx = value - 1;
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [pill, setPill] = useState({ left: 0, width: 0 });

  const movePillTo = (idx: number) => {
    const btn = btnRefs.current[idx];
    if (!btn) return;
    setPill({ left: btn.offsetLeft, width: btn.offsetWidth });
  };

  useLayoutEffect(() => { movePillTo(activeIdx); }, [activeIdx]);

  return (
    <div
      className="relative flex items-center"
      onMouseLeave={() => movePillTo(activeIdx)}
    >
      {/* Sliding pill — physically moves with hover */}
      <div
        className="pointer-events-none absolute inset-y-0 rounded-full"
        style={{
          left: pill.left,
          width: pill.width,
          background: 'rgba(255,255,255,0.09)',
          transition: 'left 200ms cubic-bezier(0.4,0,0.2,1), width 200ms cubic-bezier(0.4,0,0.2,1)',
        }}
      />

      {OPTIONS.map(({ label, val }, idx) => (
        <button
          key={val}
          ref={(el) => { btnRefs.current[idx] = el; }}
          type="button"
          onClick={() => onChange(val)}
          onMouseEnter={() => movePillTo(idx)}
          aria-pressed={val === value}
          className="relative px-4 py-2.5 text-sm sm:px-3 sm:py-1 sm:text-base transition-colors duration-150"
          style={{
            color: val === value ? 'var(--ink)' : 'var(--ink-faint)',
            fontWeight: val === value ? 600 : 400,
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
