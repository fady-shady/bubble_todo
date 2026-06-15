import type { Category, Effort, Importance, Task, Urgency } from '../types';

/**
 * Central source of truth for how a task's properties translate into visuals
 * and motion. Both the floating field and the focused editor read from here so
 * the two views always agree.
 */

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

export const CATEGORY_ORDER: Category[] = [
  'work',
  'university',
  'family',
  'personal',
  'health',
];

export const CATEGORIES: Record<Category, CategoryStyle> = {
  work: {
    label: 'Work',
    /* cyan — cool, focused */
    core: 'rgba(200, 255, 255, 0.92)',
    body: 'rgba(0, 195, 222, 0.97)',
    dark: 'rgba(0, 32, 55, 0.98)',
    glow: 'rgba(0, 210, 240, 0.58)',
    swatch: '#00c3de',
  },
  university: {
    label: 'University',
    /* electric blue — deep, intellectual */
    core: 'rgba(195, 215, 255, 0.92)',
    body: 'rgba(55, 118, 255, 0.97)',
    dark: 'rgba(5, 14, 80, 0.98)',
    glow: 'rgba(65, 130, 255, 0.56)',
    swatch: '#3776ff',
  },
  family: {
    label: 'Family',
    /* rose — warm, expressive */
    core: 'rgba(255, 195, 220, 0.92)',
    body: 'rgba(240, 55, 120, 0.97)',
    dark: 'rgba(80, 5, 35, 0.98)',
    glow: 'rgba(255, 50, 128, 0.56)',
    swatch: '#f03778',
  },
  personal: {
    label: 'Personal',
    /* amber — warm glow */
    core: 'rgba(255, 248, 190, 0.92)',
    body: 'rgba(240, 168, 18, 0.97)',
    dark: 'rgba(75, 32, 0, 0.98)',
    glow: 'rgba(255, 182, 20, 0.56)',
    swatch: '#f0a812',
  },
  health: {
    label: 'Health',
    /* emerald — vital, alive */
    core: 'rgba(188, 255, 218, 0.92)',
    body: 'rgba(25, 208, 105, 0.97)',
    dark: 'rgba(0, 48, 22, 0.98)',
    glow: 'rgba(28, 228, 112, 0.56)',
    swatch: '#19d069',
  },
};

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
export function describe(task: Task) {
  return {
    style: CATEGORIES[task.category],
    diameter: effortToDiameter(task.effort),
    opacity: importanceToOpacity(task.importance),
    speed: urgencyToSpeed(task.urgency),
  };
}
