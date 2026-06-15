import type { CategoryDef, Effort, Importance, Task, Urgency } from '../types';

export interface CategoryStyle {
  label: string;
  /** Near-white tinted specular core. */
  core: string;
  /** Rich saturated body color. */
  body: string;
  /** Deep edge color — gives depth to the liquid bead. */
  dark: string;
  /** Wide halo glow color. */
  glow: string;
  /** Solid swatch used by the color picker dots. */
  swatch: string;
}

/** Derives all visual style tokens from a single HSL hue. */
export function categoryStyleFromHue(label: string, hue: number): CategoryStyle {
  return {
    label,
    core:   `hsla(${hue}, 100%, 91%, 0.92)`,
    body:   `hsla(${hue}, 88%,  52%, 0.97)`,
    dark:   `hsla(${hue}, 78%,  8%,  0.98)`,
    glow:   `hsla(${hue}, 88%,  58%, 0.56)`,
    swatch: `hsl(${hue},  82%,  52%)`,
  };
}

export const FALLBACK_STYLE: CategoryStyle = {
  label: '?',
  core:   'rgba(220, 225, 240, 0.85)',
  body:   'rgba(130, 135, 160, 0.95)',
  dark:   'rgba(20,  22,  36,  0.98)',
  glow:   'rgba(150, 155, 180, 0.50)',
  swatch: '#828790',
};

export const DEFAULT_CATEGORIES: CategoryDef[] = [
  { id: 'work',       label: 'Work',       hue: 187 },
  { id: 'university', label: 'University', hue: 220 },
  { id: 'family',     label: 'Family',     hue: 335 },
  { id: 'personal',   label: 'Personal',   hue: 38  },
  { id: 'health',     label: 'Health',     hue: 145 },
];

/** Effort → on-screen diameter in px. */
export function effortToDiameter(effort: Effort): number {
  const min = 84;
  const step = 26;
  return min + (effort - 1) * step;
}

/** Importance → overall node opacity (more important = more present). */
export function importanceToOpacity(importance: Importance): number {
  const map: Record<Importance, number> = {
    1: 0.45,
    2: 0.72,
    3: 1,
  };
  return map[importance];
}

/** Urgency → baseline drift speed (px/sec). More urgent moves faster. */
export function urgencyToSpeed(urgency: Urgency): number {
  const map: Record<Urgency, number> = {
    1: 10,
    2: 30,
    3: 90,
  };
  return map[urgency];
}

export const URGENCY_LABEL: Record<Urgency, string> = {
  1: 'Low',
  2: 'Medium',
  3: 'High',
};

/** Convenience: full visual descriptor for a task. */
export function describe(task: Task, stylesMap: Record<string, CategoryStyle>) {
  return {
    style:    stylesMap[task.category] ?? FALLBACK_STYLE,
    diameter: effortToDiameter(task.effort),
    opacity:  importanceToOpacity(task.importance),
    speed:    urgencyToSpeed(task.urgency),
  };
}
