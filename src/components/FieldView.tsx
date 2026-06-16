import { useEffect, useMemo, useRef, useState } from 'react';
import type { Task } from '../types';
import { usePhysics, type Body } from '../hooks/usePhysics';
import { effortToDiameter, urgencyToSpeed, type CategoryStyle } from '../lib/mapping';
import { TaskNode } from './TaskNode';

interface Props {
  tasks: Task[];
  stylesMap: Record<string, CategoryStyle>;
  paused: boolean;
  onOpen: (id: string, rect: DOMRect) => void;
  onComplete: (id: string, cx: number, cy: number, color: string) => void;
}

export function FieldView({ tasks, stylesMap, paused, onOpen, onComplete }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [viewportW, setViewportW] = useState(window.innerWidth);
  useEffect(() => {
    const handler = () => setViewportW(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  // Scale bubbles down on narrow screens: 60% at ≤375px, 100% at ≥900px
  const scale = Math.min(1, Math.max(0.6, viewportW / 900));

  const bodies = useMemo<Body[]>(
    () =>
      tasks.map((t) => ({
        id: t.id,
        radius: (effortToDiameter(t.effort) / 2) * scale,
        speed: urgencyToSpeed(t.urgency),
      })),
    [tasks, scale],
  );

  const { registerNode, startDrag, moveDrag, endDrag } = usePhysics(bodies, containerRef, paused);

  return (
    <div ref={containerRef} className="fixed inset-0 overflow-hidden">
      {tasks.map((task) => (
        <TaskNode
          key={task.id}
          task={task}
          scale={scale}
          stylesMap={stylesMap}
          registerNode={registerNode}
          onOpen={onOpen}
          onComplete={onComplete}
          startDrag={startDrag}
          moveDrag={moveDrag}
          endDrag={endDrag}
        />
      ))}
    </div>
  );
}
