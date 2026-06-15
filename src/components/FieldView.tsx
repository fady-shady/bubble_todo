import { useMemo, useRef } from 'react';
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

  const bodies = useMemo<Body[]>(
    () =>
      tasks.map((t) => ({
        id: t.id,
        radius: effortToDiameter(t.effort) / 2,
        speed: urgencyToSpeed(t.urgency),
      })),
    [tasks],
  );

  const { registerNode, startDrag, moveDrag, endDrag } = usePhysics(bodies, containerRef, paused);

  return (
    <div ref={containerRef} className="fixed inset-0 overflow-hidden">
      {tasks.map((task) => (
        <TaskNode
          key={task.id}
          task={task}
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
