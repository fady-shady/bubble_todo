import { useCallback, useEffect, useRef, useState } from 'react';
import type { Task, Effort, Importance, Urgency } from '../types';
import { supabase } from '../lib/supabase';

interface DbTask {
  id: string;
  title: string;
  notes: string;
  category_id: string | null;
  effort: number;
  importance: number;
  urgency: number;
  is_completed: boolean;
  parent_task_id: string | null;
  created_at: string;
}

function dbToTask(row: DbTask): Task {
  return {
    id: row.id,
    title: row.title,
    notes: row.notes,
    category: row.category_id ?? 'personal',
    effort: Math.min(6, Math.max(1, row.effort)) as Effort,
    importance: Math.min(3, Math.max(1, row.importance)) as Importance,
    urgency: Math.min(3, Math.max(1, row.urgency)) as Urgency,
  };
}

const DEFAULT_TASK = {
  title: 'New Task',
  notes: '',
  category_id: null as string | null,
  effort: 3,
  importance: 3,
  urgency: 1,
  is_completed: false,
  parent_task_id: null as string | null,
};

export function useTasks(userId: string | null) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const debounceRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    if (!userId) {
      setTasks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    supabase
      .from('tasks')
      .select('*')
      .eq('is_completed', false)
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (!error && data) setTasks((data as DbTask[]).map(dbToTask));
        setLoading(false);
      });
  }, [userId]);

  const updateTask = useCallback((id: string, patch: Partial<Task>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));

    const dbPatch: Record<string, unknown> = {};
    if (patch.title !== undefined) dbPatch.title = patch.title;
    if (patch.notes !== undefined) dbPatch.notes = patch.notes;
    if (patch.category !== undefined) dbPatch.category_id = patch.category;
    if (patch.effort !== undefined) dbPatch.effort = patch.effort;
    if (patch.importance !== undefined) dbPatch.importance = patch.importance;
    if (patch.urgency !== undefined) dbPatch.urgency = patch.urgency;

    clearTimeout(debounceRef.current[id]);
    debounceRef.current[id] = setTimeout(() => {
      supabase.from('tasks').update(dbPatch).eq('id', id).then(() => {});
    }, 400);
  }, []);

  const addTask = useCallback(async (): Promise<string> => {
    const { data, error } = await supabase
      .from('tasks')
      .insert(DEFAULT_TASK)
      .select()
      .single();

    if (error || !data) return `tmp-${Date.now()}`;

    const task = dbToTask(data as DbTask);
    setTasks((prev) => [...prev, task]);
    return task.id;
  }, []);

  const removeTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    supabase.from('tasks').delete().eq('id', id).then(() => {});
  }, []);

  const completeTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    supabase
      .from('tasks')
      .update({ is_completed: true, completed_at: new Date().toISOString() })
      .eq('id', id)
      .then(() => {});
  }, []);

  return { tasks, loading, updateTask, addTask, removeTask, completeTask } as const;
}
