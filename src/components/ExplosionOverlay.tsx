import { useMemo } from 'react';

interface Props {
  cx: number;
  cy: number;
  color: string;
}

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

export function ExplosionOverlay({ cx, cy, color }: Props) {
  const particles = useMemo(() => {
    const list = [];

    // Layer 1 — 16 close fast shards (inner burst)
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2 + rand(-0.2, 0.2);
      const dist = rand(55, 110);
      list.push({
        id: `a${i}`,
        tx: Math.cos(angle) * dist,
        ty: Math.sin(angle) * dist,
        size: rand(4, 9),
        duration: rand(320, 440),
        delay: rand(0, 30),
        opacity: 1,
      });
    }

    // Layer 2 — 20 mid-range chunks
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2 + rand(-0.3, 0.3);
      const dist = rand(110, 210);
      list.push({
        id: `b${i}`,
        tx: Math.cos(angle) * dist,
        ty: Math.sin(angle) * dist,
        size: rand(6, 14),
        duration: rand(400, 560),
        delay: rand(0, 50),
        opacity: 0.9,
      });
    }

    // Layer 3 — 14 far stragglers, bigger pieces
    for (let i = 0; i < 14; i++) {
      const angle = rand(0, Math.PI * 2);
      const dist = rand(200, 340);
      list.push({
        id: `c${i}`,
        tx: Math.cos(angle) * dist,
        ty: Math.sin(angle) * dist,
        size: rand(8, 18),
        duration: rand(500, 700),
        delay: rand(20, 80),
        opacity: 0.75,
      });
    }

    return list;
  }, []);

  return (
    <div className="explosion-overlay" aria-hidden="true">
      {/* Shockwave ring */}
      <div
        className="explosion-shockwave"
        style={{ left: cx, top: cy, borderColor: color }}
      />
      {/* Flash */}
      <div
        className="explosion-flash"
        style={{ left: cx, top: cy, background: color }}
      />
      {/* Particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="explosion-particle"
          style={
            {
              left: cx,
              top: cy,
              width: p.size,
              height: p.size,
              background: color,
              opacity: p.opacity,
              animationDuration: `${p.duration}ms`,
              animationDelay: `${p.delay}ms`,
              '--tx': `${p.tx}px`,
              '--ty': `${p.ty}px`,
              '--pc': color,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
