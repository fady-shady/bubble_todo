import { useCallback, useEffect, useMemo, useState } from 'react';
import type { CategoryDef } from '../types';
import { categoryStyleFromHue, DEFAULT_CATEGORIES, type CategoryStyle } from '../lib/mapping';

const CAT_KEY = 'field.categories.v1';

function loadCategories(): CategoryDef[] {
  try {
    const raw = localStorage.getItem(CAT_KEY);
    if (!raw) return DEFAULT_CATEGORIES;
    const parsed = JSON.parse(raw) as CategoryDef[];
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_CATEGORIES;
    return parsed;
  } catch {
    return DEFAULT_CATEGORIES;
  }
}

export function useCategories() {
  const [categories, setCategories] = useState<CategoryDef[]>(loadCategories);

  useEffect(() => {
    localStorage.setItem(CAT_KEY, JSON.stringify(categories));
  }, [categories]);

  const addCategory = useCallback((label: string, hue: number): string => {
    const id = `cat-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
    setCategories((prev) => [...prev, { id, label, hue }]);
    return id;
  }, []);

  const updateCategory = useCallback((id: string, patch: { label?: string; hue?: number }) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const stylesMap = useMemo<Record<string, CategoryStyle>>(
    () => Object.fromEntries(categories.map((c) => [c.id, categoryStyleFromHue(c.label, c.hue)])),
    [categories],
  );

  return { categories, stylesMap, addCategory, updateCategory, deleteCategory };
}
