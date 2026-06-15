import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Task } from '../types';
import { CATEGORIES, type CategoryStyle } from '../lib/mapping';
import { ColorPicker } from './controls/ColorPicker';
import { EffortBar } from './controls/EffortBar';
import { ImportanceToggle } from './controls/ImportanceToggle';
import { UrgencySelector } from './controls/UrgencySelector';

const MORPH_DURATION = 900;

const S = { close: 0, title: 40, notes: 130, row1: 230, row2: 300, row3: 370, row4: 440 };

const GREY_STYLE: CategoryStyle = {
  label: 'New',
  core: 'rgba(220, 225, 240, 0.85)',
  body: 'rgba(130, 135, 160, 0.95)',
  dark: 'rgba(20, 22, 36, 0.98)',
  glow: 'rgba(150, 155, 180, 0.50)',
  swatch: '#828790',
};

function Row({ label, delay, children }: { label: string; delay: number; children: React.ReactNode }) {
  return (
    <div
      className="reveal-item flex items-center gap-6"
      style={{ animationDelay: `${delay}ms` }}
    >
      <span className="w-28 shrink-0 text-base" style={{ color: 'var(--ink-soft)' }}>
        {label}
      </span>
      {children}
    </div>
  );
}

interface ControlsProps {
  category: Task['category'];
  effort: Task['effort'];
  importance: Task['importance'];
  urgency: Task['urgency'];
  onChange: (patch: Partial<Task>) => void;
}

const TaskControls = memo(function TaskControls({
  category, effort, importance, urgency, onChange,
}: ControlsProps) {
  return (
    <div className="mt-10 flex flex-col gap-5 pb-6">
      <Row label="Color" delay={S.row1}>
        <ColorPicker value={category} onChange={(c) => onChange({ category: c })} />
      </Row>
      <Row label="Size / Effort" delay={S.row2}>
        <EffortBar value={effort} onChange={(e) => onChange({ effort: e })} />
      </Row>
      <Row label="Importance" delay={S.row3}>
        <ImportanceToggle value={importance} onChange={(i) => onChange({ importance: i })} />
      </Row>
      <Row label="Urgency" delay={S.row4}>
        <UrgencySelector value={urgency} onChange={(u) => onChange({ urgency: u })} />
      </Row>
    </div>
  );
});

interface Props {
  task: Task;
  morphRect: DOMRect | null;
  isNew?: boolean;
  onChange: (patch: Partial<Task>) => void;
  onClose: () => void;
  onRemove: () => void;
}

export function FocusView({ task, morphRect, isNew, onChange, onClose, onRemove }: Props) {
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const style = isNew ? GREY_STYLE : CATEGORIES[task.category];
  const [confirmRemove, setConfirmRemove] = useState(false);

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const stableChange = useMemo(() => (patch: Partial<Task>) => onChangeRef.current(patch), []);

  const cx = morphRect ? morphRect.left + morphRect.width / 2 : window.innerWidth / 2;
  const cy = morphRect ? morphRect.top + morphRect.height / 2 : window.innerHeight / 2;
  const r0 = morphRect ? morphRect.width / 2 : 0;

  const [expanded, setExpanded] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    let r2: number;
    let t: ReturnType<typeof setTimeout>;
    const r1 = requestAnimationFrame(() => {
      r2 = requestAnimationFrame(() => {
        setExpanded(true);
        t = setTimeout(() => setRevealed(true), MORPH_DURATION + 60);
      });
    });
    return () => { cancelAnimationFrame(r1); cancelAnimationFrame(r2); clearTimeout(t); };
  }, []);

  const handleClose = useCallback(() => {
    setClosing(true);
    setTimeout(onClose, 380);
  }, [onClose]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleClose]);

  const autosize = (el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  };
  useEffect(() => autosize(titleRef.current), [task.id]);

  const clipPath = expanded
    ? `circle(4000px at ${cx}px ${cy}px)`
    : `circle(${r0}px at ${cx}px ${cy}px)`;

  return (
    <div className={`morph-container${closing ? ' closing' : ''}`}>
      <div className="morph-reveal-mask" style={{ clipPath }}>
        <div
          className={`morph-orb${expanded ? ' dimming' : ''}`}
          style={{
            background: `radial-gradient(circle at ${cx}px ${cy}px, ${style.core} 0%, ${style.body} 28%, ${style.dark} 62%, rgba(2,4,10,0.99) 100%)`,
          }}
        />
        <div
          className={`morph-atmosphere${expanded ? ' rising' : ''}`}
          style={{
            background: `
              radial-gradient(120% 90% at 16% 18%, ${style.glow} 0%, transparent 42%),
              radial-gradient(120% 100% at 84% 96%, rgba(8,12,20,0.6) 0%, transparent 55%),
              linear-gradient(180deg, var(--bg-1) 0%, var(--bg-0) 100%)`,
          }}
        />
      </div>

      <div
        className={`morph-content${revealed ? ' visible' : ''}`}
        onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
      >
        {/* Close button — top right */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close"
          className="reveal-item fixed right-7 top-6 z-30 grid h-10 w-10 place-items-center rounded-full text-2xl transition-colors duration-200 hover:bg-white/10"
          style={{ animationDelay: `${S.close}ms`, color: 'var(--ink-faint)' }}
        >
          ×
        </button>

        {/* Remove button — top left */}
        <button
          type="button"
          onClick={() => setConfirmRemove(true)}
          aria-label="Remove task"
          className="reveal-item fixed left-7 top-6 z-30 grid h-10 w-10 place-items-center rounded-full transition-all duration-200"
          style={{
            animationDelay: `${S.close}ms`,
            color: 'rgba(240, 80, 80, 0.72)',
            background: 'rgba(210, 48, 64, 0.12)',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(210, 48, 64, 0.24)';
            (e.currentTarget as HTMLButtonElement).style.color = 'rgba(240, 80, 80, 1)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(210, 48, 64, 0.12)';
            (e.currentTarget as HTMLButtonElement).style.color = 'rgba(240, 80, 80, 0.72)';
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14H6L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4h6v2" />
          </svg>
        </button>

        <div
          className="mx-auto flex min-h-full w-full max-w-5xl flex-col px-8 py-16 md:px-14"
          onClick={(e) => e.stopPropagation()}
        >
          <textarea
            ref={titleRef}
            value={task.title}
            onChange={(e) => { onChange({ title: e.target.value }); autosize(e.target); }}
            rows={1}
            placeholder="Untitled thought"
            className="reveal-item editable-title text-5xl md:text-6xl"
            style={{ animationDelay: `${S.title}ms` }}
            spellCheck={false}
          />

          <textarea
            value={task.notes}
            onChange={(e) => onChange({ notes: e.target.value })}
            placeholder="Start typing your task details…"
            className="reveal-item editable-notes mt-8 flex-1 text-xl"
            style={{ animationDelay: `${S.notes}ms`, minHeight: '32vh' }}
          />

          <TaskControls
            category={task.category}
            effort={task.effort}
            importance={task.importance}
            urgency={task.urgency}
            onChange={stableChange}
          />
        </div>
      </div>

      {/* Remove confirmation popup */}
      {confirmRemove && (
        <div className="remove-confirm-backdrop" onClick={() => setConfirmRemove(false)}>
          <div className="remove-confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <p className="remove-confirm-text">Remove this task permanently?</p>
            <div className="remove-confirm-actions">
              <button
                type="button"
                className="remove-confirm-cancel"
                onClick={() => setConfirmRemove(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="remove-confirm-delete"
                onClick={onRemove}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
