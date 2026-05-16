import React from "react";

const products = [
  {
    title: "Obsidian Essence",
    subtitle: "Original",
    notes: "Smoked vanilla, amber, black pepper",
  },
  {
    title: "Obsidian Night",
    subtitle: "Deep Oud",
    notes: "Oud resin, leather, charred cedar",
  },
  {
    title: "Obsidian Gold",
    subtitle: "Amber Saffron",
    notes: "Saffron thread, gold musk, warm spice",
  },
];

export function ProductCards() {
  return (
    <div className="product-card-grid">
      {products.map((product, index) => (
        <article className="archive-card" key={product.title} style={{ "--delay": index }}>
          <span className="archive-number">0{index + 1}</span>
          <div className="archive-image">
            <img
              src="/assets/obsidian-reference-560.jpg"
              srcSet="/assets/obsidian-reference-560.jpg 560w, /assets/obsidian-reference-900.jpg 900w"
              sizes="(max-width: 720px) 92vw, 33vw"
              alt=""
              loading="lazy"
              decoding="async"
            />
          </div>
          <div>
            <p className="archive-subtitle">{product.subtitle}</p>
            <h3>{product.title}</h3>
            <p>{product.notes}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
