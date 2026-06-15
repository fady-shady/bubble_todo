import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { CategoryDef } from '../../types';
import { categoryStyleFromHue } from '../../lib/mapping';

interface Props {
  existing: CategoryDef | null;
  onSave: (label: string, hue: number) => void;
  onDelete: () => void;
  onClose: () => void;
}

export function CategoryEditor({ existing, onSave, onDelete, onClose }: Props) {
  const [label, setLabel] = useState(existing?.label ?? '');
  const [hue, setHue] = useState(existing?.hue ?? 200);
  const inputRef = useRef<HTMLInputElement>(null);
  const isNew = existing === null;

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  // Capture phase so this fires before FocusView's bubble-phase Escape handler
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopImmediatePropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey, { capture: true });
    return () => window.removeEventListener('keydown', onKey, { capture: true });
  }, [onClose]);

  const preview = categoryStyleFromHue(label || 'Preview', hue);

  const handleSave = () => {
    const trimmed = label.trim();
    if (!trimmed) return;
    onSave(trimmed, hue);
  };

  return createPortal(
    <div className="cat-editor-backdrop" onClick={onClose}>
      <div className="cat-editor-dialog" onClick={(e) => e.stopPropagation()}>

        <div className="cat-editor-header">
          <div
            className="cat-editor-orb"
            style={{
              background: `radial-gradient(circle at 38% 32%, ${preview.core} 0%, ${preview.swatch} 70%)`,
              boxShadow: `0 0 22px ${preview.glow}`,
            }}
          />
          <input
            ref={inputRef}
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Category name"
            className="cat-editor-name-input"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
            }}
          />
        </div>

        <div className="cat-editor-hue-row">
          <div className="cat-editor-hue-dot" style={{ background: preview.swatch }} />
          <input
            type="range"
            min={0}
            max={359}
            value={hue}
            onChange={(e) => setHue(Number(e.target.value))}
            className="cat-editor-hue-slider"
            style={{ '--thumb-color': preview.swatch } as React.CSSProperties}
          />
        </div>

        <div className="cat-editor-actions">
          {!isNew && (
            <button type="button" className="cat-editor-delete" onClick={onDelete}>
              Delete
            </button>
          )}
          <div style={{ flex: 1 }} />
          <button type="button" className="cat-editor-cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="cat-editor-save"
            onClick={handleSave}
            disabled={!label.trim()}
          >
            {isNew ? 'Add' : 'Save'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
