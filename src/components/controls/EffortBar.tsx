import { useState } from 'react';
import type { Effort } from '../../types';

interface Props {
  value: Effort;
  onChange: (e: Effort) => void;
}

const SEGMENTS: Effort[] = [1, 2, 3, 4, 5, 6];
const EFFORT_TIME: Record<Effort, string> = {
  1: '~30 min',
  2: '~1–2 h',
  3: '~3–5 h',
  4: '~half day',
  5: '~1–2 days',
  6: '~1 week+',
};

export function EffortBar({ value, onChange }: Props) {
  const [hovered, setHovered] = useState<Effort | null>(null);

  return (
    <div
      className="flex items-center gap-2.5"
      onMouseLeave={() => setHovered(null)}
    >
      {SEGMENTS.map((seg) => {
        const filled = seg <= value;
        const isHovered = seg === hovered;
        const bg = isHovered
          ? 'rgba(236, 240, 247, 0.52)'
          : filled
            ? 'rgba(236, 240, 247, 0.92)'
            : 'rgba(236, 240, 247, 0.16)';

        return (
          <button
            key={seg}
            type="button"
            onClick={() => onChange(seg)}
            onMouseEnter={() => setHovered(seg)}
            aria-label={`Effort ${seg} — ${EFFORT_TIME[seg]}`}
            aria-pressed={seg === value}
            data-tooltip={EFFORT_TIME[seg]}
            className="flex items-center justify-center transition-all duration-150"
            style={{ width: 36, height: 44, background: 'transparent', border: 'none', padding: 0 }}
          >
            <span
              className="rounded-full block"
              style={{
                width: 36,
                height: 5,
                background: bg,
                boxShadow: filled && !isHovered ? '0 0 10px rgba(236,240,247,0.4)' : 'none',
              }}
            />
          </button>
        );
      })}
    </div>
  );
}
