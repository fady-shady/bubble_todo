export type Category = string;

export interface CategoryDef {
  id: string;
  label: string;
  /** HSL hue 0–359 */
  hue: number;
}

/** 1 (tiny effort) → 6 (large effort). Drives node diameter. */
export type Effort = 1 | 2 | 3 | 4 | 5 | 6;

/** 1 (low) · 2 (medium) · 3 (high). Drives node opacity. */
export type Importance = 1 | 2 | 3;

/** 1 (low) · 2 (medium) · 3 (high). Drives motion speed. */
export type Urgency = 1 | 2 | 3;

export interface Task {
  id: string;
  title: string;
  notes: string;
  category: Category;
  effort: Effort;
  importance: Importance;
  urgency: Urgency;
}
