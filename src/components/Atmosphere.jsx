import React from "react";

export function Atmosphere() {
  return (
    <div className="atmosphere" aria-hidden="true">
      <div className="smoke smoke-a" />
      <div className="gold-streak streak-one" />
      <div className="gold-streak streak-two" />
      <div className="particle-field">
        {Array.from({ length: 14 }).map((_, index) => {
          const left = (index * 29 + 8) % 100;
          const top = (index * 17 + 14) % 100;
          return <span key={index} style={{ "--i": index, "--left": `${left}%`, "--top": `${top}%` }} />;
        })}
      </div>
    </div>
  );
}
