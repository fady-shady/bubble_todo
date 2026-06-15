import { useLayoutEffect, useRef, useState } from 'react';
import type { Importance } from '../../types';

interface Props {
  value: Importance;
  onChange: (i: Importance) => void;
}

const OPTIONS: { label: string; val: Importance }[] = [
  { label: 'Low',    val: 1 },
  { label: 'Medium', val: 2 },
  { label: 'High',   val: 3 },
];

export function ImportanceToggle({ value, onChange }: Props) {
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
          key={label}
          ref={(el) => { btnRefs.current[idx] = el; }}
          type="button"
          onClick={() => onChange(val)}
          onMouseEnter={() => movePillTo(idx)}
          aria-pressed={idx === activeIdx}
          className="relative px-3 py-1 text-base transition-colors duration-150"
          style={{
            color: idx === activeIdx ? 'var(--ink)' : 'var(--ink-faint)',
            fontWeight: idx === activeIdx ? 600 : 400,
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
