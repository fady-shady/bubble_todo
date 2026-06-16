import { useCallback, useEffect, useMemo, useState } from 'react';
import type { CategoryDef } from '../types';
import { categoryStyleFromHue, type CategoryStyle } from '../lib/mapping';
import { supabase } from '../lib/supabase';

interface DbCategory {
  id: string;
  label: string;
  hue: number;
  is_archived: boolean;
  archived_at: string | null;
}

function dbToCategoryDef(row: DbCategory): CategoryDef {
  return { id: row.id, label: row.label, hue: row.hue };
}

export function useCategories(userId: string | null) {
  const [categories, setCategories] = useState<CategoryDef[]>([]);

  useEffect(() => {
    if (!userId) {
      setCategories([]);
      return;
    }

    supabase
      .from('categories')
      .select('*')
      .eq('is_archived', false)
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (!error && data) setCategories((data as DbCategory[]).map(dbToCategoryDef));
      });
  }, [userId]);

  const addCategory = useCallback(async (label: string, hue: number): Promise<string> => {
    const { data, error } = await supabase
      .from('categories')
      .insert({ label, hue })
      .select()
      .single();

    if (error || !data) return `tmp-${Date.now()}`;
    const cat = dbToCategoryDef(data as DbCategory);
    setCategories((prev) => [...prev, cat]);
    return cat.id;
  }, []);

  const updateCategory = useCallback((id: string, patch: { label?: string; hue?: number }) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
    supabase.from('categories').update(patch).eq('id', id).then(() => {});
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    supabase
      .from('categories')
      .update({ is_archived: true, archived_at: new Date().toISOString() })
      .eq('id', id)
      .then(() => {});
  }, []);

  const stylesMap = useMemo<Record<string, CategoryStyle>>(
    () => Object.fromEntries(categories.map((c) => [c.id, categoryStyleFromHue(c.label, c.hue)])),
    [categories],
  );

  return { categories, stylesMap, addCategory, updateCategory, deleteCategory };
}
