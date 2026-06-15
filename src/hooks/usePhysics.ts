import { useCallback, useEffect, useRef } from 'react';

export interface Body {
  id: string;
  /** On-screen radius in px (half the node diameter). */
  radius: number;
  /** Baseline drift speed in px/sec (from urgency). */
  speed: number;
}

interface State {
  x: number;
  y: number;
  /** Current heading (radians) for the gentle baseline drift. */
  heading: number;
  /** Extra velocity from repulsion / bounds, decays over time. */
  ex: number;
  ey: number;
  /** Per-node phase so wobble is desynchronized. */
  phase: number;
  radius: number;
  speed: number;
}

// Tuning — chosen for "calm living ecosystem", never chaotic.
const WOBBLE_RATE = 0.35; // how much the heading meanders
const REPULSION = 520; // strength of soft push between nodes
const REPULSION_MARGIN = 26; // breathing room beyond touching
const EDGE_MARGIN = 40; // start easing back this far from the wall
const EDGE_PUSH = 90; // inward nudge strength near edges
const EXTRA_DAMP = 1.8; // per-second decay of repulsion velocity
const MAX_DT = 0.05; // clamp big frame gaps (tab switches)
const FLING_SAMPLE_MS = 80; // rolling window used to compute release velocity
const MAX_FLING_SPEED = 1400; // px/s cap so a fast swipe doesn't launch into orbit

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  );
}

/**
 * Runs a single requestAnimationFrame physics loop and writes node positions
 * straight to the DOM via transforms — no React re-render per frame.
 *
 * Register each rendered node element through the returned `registerNode` ref
 * callback. Pass the current bodies (id/radius/speed); changes reconcile in
 * place without resetting positions.
 */
interface DragState {
  id: string;
  /** Offset from pointer to node centre, so the node doesn't jump on grab. */
  ox: number;
  oy: number;
  /** Rolling window of recent pointer positions for fling velocity. */
  samples: Array<{ px: number; py: number; t: number }>;
}

export function usePhysics(
  bodies: Body[],
  containerRef: React.RefObject<HTMLElement | null>,
  paused: boolean,
) {
  const statesRef = useRef<Map<string, State>>(new Map());
  const elementsRef = useRef<Map<string, HTMLElement>>(new Map());
  const bodiesRef = useRef<Body[]>(bodies);
  const pausedRef = useRef(paused);
  const sizeRef = useRef({ w: 0, h: 0 });
  const dragRef = useRef<DragState | null>(null);

  bodiesRef.current = bodies;
  pausedRef.current = paused;

  const registerNode = useCallback((id: string, el: HTMLElement | null) => {
    if (el) elementsRef.current.set(id, el);
    else elementsRef.current.delete(id);
  }, []);

  const startDrag = useCallback((id: string, pointerX: number, pointerY: number) => {
    const s = statesRef.current.get(id);
    if (!s) return;
    dragRef.current = {
      id,
      ox: pointerX - s.x,
      oy: pointerY - s.y,
      samples: [{ px: pointerX, py: pointerY, t: performance.now() }],
    };
  }, []);

  const moveDrag = useCallback((pointerX: number, pointerY: number) => {
    const drag = dragRef.current;
    if (!drag) return;
    const s = statesRef.current.get(drag.id);
    if (!s) return;
    const { w, h } = sizeRef.current;
    const W = w || window.innerWidth;
    const H = h || window.innerHeight;
    s.x = Math.max(s.radius, Math.min(W - s.radius, pointerX - drag.ox));
    s.y = Math.max(s.radius, Math.min(H - s.radius, pointerY - drag.oy));
    s.ex = 0;
    s.ey = 0;
    // Record sample, drop anything outside the rolling window.
    const now = performance.now();
    drag.samples.push({ px: pointerX, py: pointerY, t: now });
    const cutoff = now - FLING_SAMPLE_MS;
    while (drag.samples.length > 1 && drag.samples[0].t < cutoff) {
      drag.samples.shift();
    }
  }, []);

  const endDrag = useCallback(() => {
    const drag = dragRef.current;
    dragRef.current = null;
    if (!drag) return;
    const s = statesRef.current.get(drag.id);
    if (!s) return;
    const { samples } = drag;
    if (samples.length < 2) return;
    const first = samples[0];
    const last = samples[samples.length - 1];
    const elapsed = (last.t - first.t) / 1000;
    if (elapsed < 0.001) return;
    let vx = (last.px - first.px) / elapsed;
    let vy = (last.py - first.py) / elapsed;
    const mag = Math.hypot(vx, vy);
    if (mag > MAX_FLING_SPEED) {
      vx = (vx / mag) * MAX_FLING_SPEED;
      vy = (vy / mag) * MAX_FLING_SPEED;
    }
    s.ex = vx;
    s.ey = vy;
  }, []);

  // Track container size.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      sizeRef.current = { w: el.clientWidth, h: el.clientHeight };
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [containerRef]);

  useEffect(() => {
    const states = statesRef.current;
    const reduced = prefersReducedMotion();
    let raf = 0;
    let last = performance.now();

    // Seed positions for any new bodies, spread across the field.
    const ensureStates = () => {
      const { w, h } = sizeRef.current;
      const W = w || window.innerWidth;
      const H = h || window.innerHeight;
      const present = new Set<string>();
      for (const b of bodiesRef.current) {
        present.add(b.id);
        const existing = states.get(b.id);
        if (existing) {
          existing.radius = b.radius;
          existing.speed = b.speed;
          continue;
        }
        const r = b.radius;
        states.set(b.id, {
          x: r + Math.random() * Math.max(1, W - r * 2),
          y: r + Math.random() * Math.max(1, H - r * 2),
          heading: Math.random() * Math.PI * 2,
          ex: 0,
          ey: 0,
          phase: Math.random() * Math.PI * 2,
          radius: r,
          speed: b.speed,
        });
      }
      for (const id of [...states.keys()]) {
        if (!present.has(id)) states.delete(id);
      }
    };

    const step = (now: number) => {
      raf = requestAnimationFrame(step);
      let dt = (now - last) / 1000;
      last = now;
      if (dt <= 0) return;
      dt = Math.min(dt, MAX_DT);

      ensureStates();
      const { w, h } = sizeRef.current;
      const W = w || window.innerWidth;
      const H = h || window.innerHeight;

      const list = [...states.values()];
      const ids = [...states.keys()];

      const moving = !reduced && !pausedRef.current;

      const draggedId = dragRef.current?.id ?? null;

      if (moving) {
        // Soft mutual repulsion (O(n²) — fine for ~20–40 nodes).
        for (let i = 0; i < list.length; i++) {
          for (let j = i + 1; j < list.length; j++) {
            const a = list[i];
            const b = list[j];
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            let dist = Math.hypot(dx, dy);
            const minDist = a.radius + b.radius + REPULSION_MARGIN;
            if (dist < minDist) {
              if (dist < 0.0001) dist = 0.0001;
              const nx = dx / dist;
              const ny = dy / dist;
              const overlap = 1 - dist / minDist; // 0..1
              const force = overlap * REPULSION * dt;
              // Don't push the dragged node — the pointer owns its position.
              if (ids[i] !== draggedId) { a.ex -= nx * force; a.ey -= ny * force; }
              if (ids[j] !== draggedId) { b.ex += nx * force; b.ey += ny * force; }
            }
          }
        }

        for (let i = 0; i < list.length; i++) {
          const s = list[i];

          // Dragged node: position is set by moveDrag(); skip all physics for it.
          if (ids[i] === draggedId) continue;

          // Gentle meandering of the drift heading.
          s.phase += dt * (0.6 + s.speed * 0.01);
          s.heading += Math.sin(s.phase) * WOBBLE_RATE * dt;

          // Baseline calm drift from urgency-derived speed.
          const baseVx = Math.cos(s.heading) * s.speed;
          const baseVy = Math.sin(s.heading) * s.speed;

          // Soft edge cushioning — nudge inward, never hard bounce.
          if (s.x < s.radius + EDGE_MARGIN)
            s.ex += EDGE_PUSH * dt * (1 - (s.x - s.radius) / EDGE_MARGIN);
          if (s.x > W - s.radius - EDGE_MARGIN)
            s.ex -=
              EDGE_PUSH * dt * (1 - (W - s.radius - s.x) / EDGE_MARGIN);
          if (s.y < s.radius + EDGE_MARGIN)
            s.ey += EDGE_PUSH * dt * (1 - (s.y - s.radius) / EDGE_MARGIN);
          if (s.y > H - s.radius - EDGE_MARGIN)
            s.ey -=
              EDGE_PUSH * dt * (1 - (H - s.radius - s.y) / EDGE_MARGIN);

          // Integrate.
          s.x += (baseVx + s.ex) * dt;
          s.y += (baseVy + s.ey) * dt;

          // Decay the extra (repulsion/edge) velocity so motion stays calm.
          const decay = Math.exp(-EXTRA_DAMP * dt);
          s.ex *= decay;
          s.ey *= decay;

          // Edge bounce — reflect heading so base drift points away from wall.
          if (s.x <= s.radius) {
            s.x = s.radius;
            if (Math.cos(s.heading) < 0) s.heading = Math.PI - s.heading;
            s.ex = Math.abs(s.ex);
          } else if (s.x >= W - s.radius) {
            s.x = W - s.radius;
            if (Math.cos(s.heading) > 0) s.heading = Math.PI - s.heading;
            s.ex = -Math.abs(s.ex);
          }
          if (s.y <= s.radius) {
            s.y = s.radius;
            if (Math.sin(s.heading) < 0) s.heading = -s.heading;
            s.ey = Math.abs(s.ey);
          } else if (s.y >= H - s.radius) {
            s.y = H - s.radius;
            if (Math.sin(s.heading) > 0) s.heading = -s.heading;
            s.ey = -Math.abs(s.ey);
          }
        }
      }

      // Write transforms.
      for (let i = 0; i < ids.length; i++) {
        const el = elementsRef.current.get(ids[i]);
        if (!el) continue;
        const s = list[i];
        el.style.transform = `translate3d(${s.x - s.radius}px, ${
          s.y - s.radius
        }px, 0)`;
      }
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // Loop reads bodies/paused through refs, so it only needs to mount once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { registerNode, startDrag, moveDrag, endDrag } as const;
}
