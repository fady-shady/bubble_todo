import { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { useTasks } from './hooks/useTasks';
import { useCategories } from './hooks/useCategories';
import { FieldView } from './components/FieldView';
import { FocusView } from './components/FocusView';
import { ExplosionOverlay } from './components/ExplosionOverlay';
import { AuthScreen } from './components/AuthScreen';
import { ContextMenu } from './components/ContextMenu';

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
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number } | null>(null);

  if (auth.loading) return null;
  if (!auth.session) return <AuthScreen auth={auth} />;

  const focused = focusId ? tasks.find((t) => t.id === focusId) ?? null : null;

  const handleOpen = (id: string, rect: DOMRect) => {
    setMorphRect(rect);
    setIsNewTask(false);
    setFocusId(id);
  };

  const handleAddBubble = async (x: number, y: number) => {
    const id = await addTask();
    const fakeRect = new DOMRect(x - 28, y - 28, 56, 56);
    setMorphRect(fakeRect);
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

  const handleContextMenu = (e: React.MouseEvent) => {
    if (focusId !== null) return;
    e.preventDefault();
    setCtxMenu({ x: e.clientX, y: e.clientY });
  };

  return (
    <div className="contents" onContextMenu={handleContextMenu}>
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
          {/* FAB — adds a new bubble; primary action on mobile (no right-click) */}
          <button
            className="add-fab"
            onClick={() => handleAddBubble(window.innerWidth / 2, window.innerHeight / 2)}
            aria-label="Add new task"
          >
            <div className="add-fab-halo" />
            <div className="add-fab-body" />
            <span className="add-fab-icon">+</span>
          </button>

          {/* Sign-out — subtle top-left anchor, accessible on mobile */}
          <button
            onClick={auth.signOut}
            aria-label="Sign out"
            className="fixed top-5 left-5 z-10 rounded-full px-3 py-1 text-xs font-medium tracking-wide opacity-30 transition-opacity hover:opacity-70"
            style={{ color: 'var(--ink-soft)', background: 'rgba(255,255,255,0.05)' }}
          >
            sign out
          </button>
        </>
      )}

      {ctxMenu && (
        <ContextMenu
          x={ctxMenu.x}
          y={ctxMenu.y}
          onAddBubble={() => handleAddBubble(ctxMenu.x, ctxMenu.y)}
          onSignOut={auth.signOut}
          onClose={() => setCtxMenu(null)}
        />
      )}
    </div>
  );
}
