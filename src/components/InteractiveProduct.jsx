import React, { useRef } from "react";
import { Lock, RotateCcw } from "lucide-react";

export function InteractiveProduct({ onLock }) {
  const cardRef = useRef(null);
  const rafRef = useRef(0);

  const handleMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      cardRef.current?.style.setProperty("--tilt-y", `${x * 18}deg`);
      cardRef.current?.style.setProperty("--tilt-x", `${y * -12}deg`);
    });
  };

  const resetTilt = () => {
    cancelAnimationFrame(rafRef.current);
    cardRef.current?.style.setProperty("--tilt-x", "0deg");
    cardRef.current?.style.setProperty("--tilt-y", "0deg");
  };

  return (
    <div className="interactive-grid">
      <div className="interactive-copy">
        <p className="eyebrow">Interactive product lock</p>
        <h2>Hold the bottle in the dark.</h2>
        <p>
          Hover the reference card to catch the gold edges, then lock the view for a focused
          product inspection.
        </p>
        <button className="gold-button" type="button" onClick={onLock}>
          <Lock size={18} />
          LOCK PRODUCT VIEW
        </button>
      </div>

      <button
        ref={cardRef}
        className="tilt-product"
        type="button"
        onPointerMove={handleMove}
        onPointerLeave={resetTilt}
        onClick={onLock}
        aria-label="Open locked product view"
      >
        <span className="tilt-shine" />
        <img
          src="/assets/obsidian-reference-900.jpg"
          srcSet="/assets/obsidian-reference-560.jpg 560w, /assets/obsidian-reference-900.jpg 900w"
          sizes="(max-width: 720px) 92vw, 44vw"
          alt="Obsidian Essence product reference"
          loading="lazy"
          decoding="async"
        />
        <span className="tilt-caption">
          <RotateCcw size={15} />
          drag the light
        </span>
      </button>
    </div>
  );
}
