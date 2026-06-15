import { useCallback, useEffect, useRef, useState } from 'react';
import type { Task } from '../types';
import { SEED_TASKS } from '../data/seed';

const STORAGE_KEY = 'field.tasks.v1';
const COMPLETED_KEY = 'field.completed.v1';

function clampImportance(i: number): Task['importance'] {
  if (i <= 1) return 1;
  if (i >= 3) return 3;
  return 2;
}

function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return SEED_TASKS;
    const parsed = JSON.parse(raw) as Task[];
    if (!Array.isArray(parsed) || parsed.length === 0) return SEED_TASKS;
    return parsed.map((t) => ({ ...t, importance: clampImportance(t.importance) }));
  } catch {
    return SEED_TASKS;
  }
}

function saveCompleted(task: Task) {
  try {
    const raw = localStorage.getItem(COMPLETED_KEY);
    const list: Task[] = raw ? (JSON.parse(raw) as Task[]) : [];
    list.push(task);
    localStorage.setItem(COMPLETED_KEY, JSON.stringify(list));
  } catch { /* silent */ }
}

function makeId() {
  return `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

const DEFAULT_TASK: Omit<Task, 'id'> = {
  title: 'New Task',
  notes: '',
  category: 'personal',
  effort: 3,
  importance: 3,
  urgency: 1,
};

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(loadTasks);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const updateTask = useCallback((id: string, patch: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    );
  }, []);

  const addTask = useCallback((): string => {
    const id = makeId();
    setTasks((prev) => [...prev, { ...DEFAULT_TASK, id }]);
    return id;
  }, []);

  const removeTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const completeTask = useCallback((id: string) => {
    setTasks((prev) => {
      const task = prev.find((t) => t.id === id);
      if (task) saveCompleted(task);
      return prev.filter((t) => t.id !== id);
    });
  }, []);

  return { tasks, updateTask, addTask, removeTask, completeTask } as const;
}
