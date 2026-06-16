import { useEffect, useRef } from 'react';

interface Props {
  x: number;
  y: number;
  onAddBubble: () => void;
  onSignOut: () => void;
  onClose: () => void;
}

export function ContextMenu({ x, y, onAddBubble, onSignOut, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handle = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('mousedown', handle);
    document.addEventListener('touchstart', handle);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handle);
      document.removeEventListener('touchstart', handle);
      document.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  // Keep menu on screen
  const menuW = 160;
  const menuH = 96;
  const left = Math.min(x, window.innerWidth - menuW - 8);
  const top = Math.min(y, window.innerHeight - menuH - 8);

  return (
    <div
      ref={ref}
      className="context-menu"
      style={{ left, top }}
    >
      <button
        className="context-menu-item"
        onClick={() => { onAddBubble(); onClose(); }}
      >
        <span className="context-menu-icon">⊕</span>
        Add Bubble
      </button>
      <div className="context-menu-divider" />
      <button
        className="context-menu-item context-menu-item--danger"
        onClick={() => { onSignOut(); onClose(); }}
      >
        <span className="context-menu-icon">→</span>
        Sign Out
      </button>
    </div>
  );
}
