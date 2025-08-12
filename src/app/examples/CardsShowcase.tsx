"use client";

import { useMemo } from "react";
import UICard from "@/components/common/UICard";

type Mode = "list" | "grid-2" | "grid-3" | "grid-4" | "masonry";

export default function CardsShowcase({ query, mode }: { query: string; mode: Mode }) {
  const items = useMemo(() => demoItems.filter((i) => i.title.toLowerCase().includes(query.toLowerCase())), [query]);

  const gridClass =
    mode === "list" ? "grid-cols-1" :
    mode === "grid-2" ? "grid-cols-1 sm:grid-cols-2" :
    mode === "grid-3" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" :
    mode === "grid-4" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" :
    "";

  if (mode === "masonry") {
    return (
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 [column-fill:balance]">
        {items.map((i) => (
          <div key={i.id} className="mb-4 [break-inside:avoid]">
            <UICard
              title={i.title}
              description={i.description}
              imageUrl={i.imageUrl}
              unoptimizedImage
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid ${gridClass} gap-4`}>
      {items.map((i) => (
        <UICard
          key={i.id}
          title={i.title}
          description={i.description}
          imageUrl={i.imageUrl}
          unoptimizedImage
        />
      ))}
    </div>
  );
}

CardsShowcase.Definitions = function _Defs() {
  return null;
};

const demoItems = [
  {
    id: "1",
    title: "Autumn Scene",
    description: "Full-bleed thumbnail at the top.",
    imageUrl: "https://cdn.midjourney.com/73e48e39-046e-4033-808a-577d4b3ad526/0_0.png",
  },
  {
    id: "2",
    title: "City Street",
    description: "No image example.",
    imageUrl: undefined,
  },
  {
    id: "3",
    title: "Landscape",
    description: "Another with image.",
    imageUrl: "https://cdn.midjourney.com/73e48e39-046e-4033-808a-577d4b3ad526/0_0.png",
  },
  {
    id: "4",
    title: "Portrait",
    description: "With image again.",
    imageUrl: "https://cdn.midjourney.com/73e48e39-046e-4033-808a-577d4b3ad526/0_0.png",
  },
];


