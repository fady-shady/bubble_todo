import { useRef } from 'react';

interface Props {
  onClick: (rect: DOMRect) => void;
}

export function AddFab({ onClick }: Props) {
  const ref = useRef<HTMLButtonElement>(null);

  return (
    <button
      ref={ref}
      type="button"
      onClick={() => {
        if (ref.current) onClick(ref.current.getBoundingClientRect());
      }}
      className="add-fab"
      aria-label="Add task"
    >
      <div className="add-fab-halo" />
      <div className="add-fab-body" />
      <span className="add-fab-icon">+</span>
    </button>
  );
}
