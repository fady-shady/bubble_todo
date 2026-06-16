import { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { useTasks } from './hooks/useTasks';
import { useCategories } from './hooks/useCategories';
import { FieldView } from './components/FieldView';
import { FocusView } from './components/FocusView';
import { AddFab } from './components/AddFab';
import { ExplosionOverlay } from './components/ExplosionOverlay';
import { AuthScreen } from './components/AuthScreen';

interface Explosion {
  cx: number;
  cy: number;
  color: string;
}

export default function App() {
  const auth = useAuth();
  const userId = auth.user?.id ?? null;

  const { tasks, updateTask, addTask, removeTask, completeTask } = useTasks(userId);
  const { categories, stylesMap, addCategory, updateCategory, deleteCategory } = useCategories(userId);

  const [focusId, setFocusId] = useState<string | null>(null);
  const [morphRect, setMorphRect] = useState<DOMRect | null>(null);
  const [isNewTask, setIsNewTask] = useState(false);
  const [explosion, setExplosion] = useState<Explosion | null>(null);

  if (auth.loading) return null;
  if (!auth.session) return <AuthScreen auth={auth} />;

  const focused = focusId ? tasks.find((t) => t.id === focusId) ?? null : null;

  const handleOpen = (id: string, rect: DOMRect) => {
    setMorphRect(rect);
    setIsNewTask(false);
    setFocusId(id);
  };

  const handleAddFab = async (rect: DOMRect) => {
    const id = await addTask();
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

      {focusId === null && (
        <>
          <button
            onClick={auth.signOut}
            className="fixed top-4 right-4 text-xs rounded-xl px-3 py-1.5 z-10"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.10)',
              color: 'rgba(200,210,240,0.5)',
            }}
          >
            sign out
          </button>
          <AddFab onClick={handleAddFab} />
        </>
      )}
    </>
  );
}
