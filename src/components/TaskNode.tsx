import { memo, useEffect, useRef, useState } from 'react';
import type { Task } from '../types';
import { describe } from '../lib/mapping';

const DRAG_THRESHOLD = 5;
const LONG_PRESS_MS = 800;

interface Props {
  task: Task;
  registerNode: (id: string, el: HTMLElement | null) => void;
  onOpen: (id: string, rect: DOMRect) => void;
  onComplete: (id: string, cx: number, cy: number, color: string) => void;
  startDrag: (id: string, x: number, y: number) => void;
  moveDrag: (x: number, y: number) => void;
  endDrag: () => void;
}

function TaskNodeImpl({ task, registerNode, onOpen, onComplete, startDrag, moveDrag, endDrag }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { style, diameter, opacity } = describe(task);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const isDragging = useRef(false);
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pressCompleted = useRef(false);
  const [pressing, setPressing] = useState(false);

  useEffect(() => {
    registerNode(task.id, ref.current);
    return () => registerNode(task.id, null);
  }, [task.id, registerNode]);

  const base = diameter * 0.13;
  const titlePenalty = Math.max(0, task.title.length - 14) * 0.12;
  const fontSize = Math.max(10, Math.min(16, base - titlePenalty));

  const cancelPress = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
    setPressing(false);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    e.currentTarget.setPointerCapture(e.pointerId);
    pointerStart.current = { x: e.clientX, y: e.clientY };
    isDragging.current = false;
    pressCompleted.current = false;

    setPressing(true);
    pressTimer.current = setTimeout(() => {
      pressTimer.current = null;
      pressCompleted.current = true;
      const el = ref.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        onComplete(task.id, rect.left + rect.width / 2, rect.top + rect.height / 2, style.body);
      }
      setPressing(false);
    }, LONG_PRESS_MS);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!pointerStart.current) return;
    const dx = e.clientX - pointerStart.current.x;
    const dy = e.clientY - pointerStart.current.y;
    if (!isDragging.current && Math.hypot(dx, dy) > DRAG_THRESHOLD) {
      isDragging.current = true;
      cancelPress();
      startDrag(task.id, e.clientX, e.clientY);
    }
    if (isDragging.current) {
      moveDrag(e.clientX, e.clientY);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!pointerStart.current) return;
    const wasDragging = isDragging.current;
    const wasCompleted = pressCompleted.current;

    cancelPress();
    pointerStart.current = null;
    isDragging.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);

    if (wasDragging) {
      endDrag();
    } else if (!wasCompleted) {
      const el = ref.current;
      if (el) onOpen(task.id, el.getBoundingClientRect());
    }
  };

  const handlePointerCancel = () => {
    cancelPress();
    if (isDragging.current) endDrag();
    pointerStart.current = null;
    isDragging.current = false;
  };

  // Ring geometry
  const ringR = diameter / 2 - 5;
  const circumference = 2 * Math.PI * ringR;

  return (
    <div
      ref={ref}
      className="node"
      style={{ width: diameter, height: diameter, opacity }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      role="button"
      tabIndex={0}
      aria-label={`Open task: ${task.title}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const el = ref.current;
          if (el) onOpen(task.id, el.getBoundingClientRect());
        }
      }}
    >
      <div
        className="node-halo"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${style.glow} 0%, transparent 65%)`,
        }}
      />
      <div
        className="node-body"
        style={{
          background: `radial-gradient(circle at 50% 44%, ${style.core} 0%, ${style.body} 30%, ${style.dark} 65%, rgba(2,4,10,0.98) 100%)`,
        }}
      />
      <span className="node-label" style={{ fontSize }}>
        {task.title}
      </span>

      {pressing && (
        <svg
          className="node-ring"
          width={diameter}
          height={diameter}
          style={{ '--circum': `${circumference}px` } as React.CSSProperties}
        >
          <circle
            className="node-ring-circle"
            cx={diameter / 2}
            cy={diameter / 2}
            r={ringR}
            fill="none"
            stroke="rgba(255,255,255,0.88)"
            strokeWidth={4}
            strokeLinecap="round"
            strokeDasharray={circumference}
          />
        </svg>
      )}
    </div>
  );
}

export const TaskNode = memo(TaskNodeImpl);
