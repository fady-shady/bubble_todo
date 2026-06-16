import { useState } from 'react';
import type { Category, CategoryDef } from '../../types';
import type { CategoryStyle } from '../../lib/mapping';
import { CategoryEditor } from './CategoryEditor';

interface Props {
  value: Category;
  categories: CategoryDef[];
  stylesMap: Record<string, CategoryStyle>;
  onChange: (c: Category) => void;
  onAdd: (label: string, hue: number) => Promise<string>;
  onUpdate: (id: string, patch: { label?: string; hue?: number }) => void;
  onDelete: (id: string) => void;
}

type EditorState =
  | { mode: 'new' }
  | { mode: 'edit'; cat: CategoryDef };

export function ColorPicker({ value, categories, stylesMap, onChange, onAdd, onUpdate, onDelete }: Props) {
  const [editor, setEditor] = useState<EditorState | null>(null);

  return (
    <>
      <div className="flex items-center gap-3 flex-wrap">
        {categories.map((cat) => {
          const s = stylesMap[cat.id];
          if (!s) return null;
          const active = cat.id === value;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onChange(cat.id)}
              onDoubleClick={() => setEditor({ mode: 'edit', cat })}
              data-tooltip={s.label}
              aria-label={s.label}
              aria-pressed={active}
              className="relative grid place-items-center rounded-full transition-transform duration-200 hover:scale-110"
              style={{ width: 38, height: 38 }}
            >
              {active && (
                <span
                  className="absolute inset-0 rounded-full"
                  style={{ boxShadow: `0 0 0 2px ${s.swatch}` }}
                />
              )}
              <span
                className="rounded-full"
                style={{
                  width: 26,
                  height: 26,
                  background: `radial-gradient(circle at 38% 32%, ${s.core} 0%, ${s.swatch} 70%)`,
                  boxShadow: active ? `0 0 16px ${s.glow}` : '0 0 6px rgba(0,0,0,0.4)',
                  opacity: active ? 1 : 0.78,
                }}
              />
            </button>
          );
        })}

        {/* Add category button */}
        <button
          type="button"
          onClick={() => setEditor({ mode: 'new' })}
          aria-label="Add category"
          data-tooltip="New category"
          className="relative grid place-items-center rounded-full transition-all duration-200 hover:scale-110"
          style={{ width: 38, height: 38 }}
        >
          <span
            className="rounded-full grid place-items-center"
            style={{
              width: 26,
              height: 26,
              border: '1.5px dashed rgba(230,238,255,0.28)',
              color: 'rgba(230,238,255,0.38)',
              fontSize: 17,
              lineHeight: '24px',
            }}
          >
            +
          </span>
        </button>
      </div>

      {editor && (
        <CategoryEditor
          existing={editor.mode === 'edit' ? editor.cat : null}
          onSave={(label, hue) => {
            if (editor.mode === 'new') {
              onAdd(label, hue).then((id) => onChange(id));
            } else {
              onUpdate(editor.cat.id, { label, hue });
            }
            setEditor(null);
          }}
          onDelete={() => {
            if (editor.mode === 'edit') onDelete(editor.cat.id);
            setEditor(null);
          }}
          onClose={() => setEditor(null)}
        />
      )}
    </>
  );
}
