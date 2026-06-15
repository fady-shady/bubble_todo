import { useState } from 'react';
import { useTasks } from './hooks/useTasks';
import { useCategories } from './hooks/useCategories';
import { FieldView } from './components/FieldView';
import { FocusView } from './components/FocusView';
import { AddFab } from './components/AddFab';
import { ExplosionOverlay } from './components/ExplosionOverlay';

interface Explosion {
  cx: number;
  cy: number;
  color: string;
}

export default function App() {
  const { tasks, updateTask, addTask, removeTask, completeTask } = useTasks();
  const { categories, stylesMap, addCategory, updateCategory, deleteCategory } = useCategories();

  const [focusId, setFocusId] = useState<string | null>(null);
  const [morphRect, setMorphRect] = useState<DOMRect | null>(null);
  const [isNewTask, setIsNewTask] = useState(false);
  const [explosion, setExplosion] = useState<Explosion | null>(null);

  const focused = focusId ? tasks.find((t) => t.id === focusId) ?? null : null;

  const handleOpen = (id: string, rect: DOMRect) => {
    setMorphRect(rect);
    setIsNewTask(false);
    setFocusId(id);
  };

  const handleAddFab = (rect: DOMRect) => {
    const id = addTask();
    setMorphRect(rect);
    setIsNewTask(true);
    setFocusId(id);
  };

  const handleClose = () => {
    if (focused && !focused.title.trim()) {
      updateTask(focused.id, { title: 'New Task' });
    }
    setFocusId(null);
    setIsNewTask(false);
  };

  const handleRemove = () => {
    if (focused) removeTask(focused.id);
    setFocusId(null);
    setIsNewTask(false);
  };

  const handleComplete = (id: string, cx: number, cy: number, color: string) => {
    completeTask(id);
    setExplosion({ cx, cy, color });
    setTimeout(() => setExplosion(null), 1100);
  };

  return (
    <>
      <div className="field-atmosphere" />
      <div className="field-dust" />

      <FieldView
        tasks={tasks}
        stylesMap={stylesMap}
        paused={focusId !== null}
        onOpen={handleOpen}
        onComplete={handleComplete}
      />

      {focused && (
        <FocusView
          task={focused}
          morphRect={morphRect}
          isNew={isNewTask}
          categories={categories}
          stylesMap={stylesMap}
          onChange={(patch) => updateTask(focused.id, patch)}
          onClose={handleClose}
          onRemove={handleRemove}
          onAddCategory={addCategory}
          onUpdateCategory={updateCategory}
          onDeleteCategory={deleteCategory}
        />
      )}

      {explosion && (
        <ExplosionOverlay cx={explosion.cx} cy={explosion.cy} color={explosion.color} />
      )}

      {focusId === null && <AddFab onClick={handleAddFab} />}
    </>
  );
}
