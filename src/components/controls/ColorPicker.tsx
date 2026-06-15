import type { Category } from '../../types';
import { CATEGORIES, CATEGORY_ORDER } from '../../lib/mapping';

interface Props {
  value: Category;
  onChange: (c: Category) => void;
}

export function ColorPicker({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-3">
      {CATEGORY_ORDER.map((cat) => {
        const active = cat === value;
        const s = CATEGORIES[cat];
        return (
          <button
            key={cat}
            type="button"
            onClick={() => onChange(cat)}
            data-tooltip={s.label}
            aria-label={s.label}
            aria-pressed={active}
            className="relative grid place-items-center rounded-full transition-transform duration-200 hover:scale-110"
            style={{ width: 38, height: 38 }}
          >
            {active && (
              <span
                className="absolute inset-0 rounded-full"
                style={{ boxShadow: `0 0 0 2px ${s.swatch}` }}
              />
            )}
            <span
              className="rounded-full"
              style={{
                width: 26,
                height: 26,
                background: `radial-gradient(circle at 38% 32%, ${s.core} 0%, ${s.swatch} 70%)`,
                boxShadow: active ? `0 0 16px ${s.glow}` : '0 0 6px rgba(0,0,0,0.4)',
                opacity: active ? 1 : 0.78,
              }}
            />
          </button>
        );
      })}
    </div>
  );
}
