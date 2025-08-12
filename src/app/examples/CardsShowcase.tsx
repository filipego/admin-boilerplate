"use client";

import { useMemo } from "react";
import UICard from "@/components/common/UICard";
import dynamic from "next/dynamic";
const Masonry = dynamic(() => import("react-masonry-css"), { ssr: false });

type LayoutMode = "list" | "grid" | "masonry";

export default function CardsShowcase({ query, layout, columns }: { query: string; layout: LayoutMode; columns: 2 | 3 | 4 }) {
  const items = useMemo(() => demoItems.filter((i) => i.title.toLowerCase().includes(query.toLowerCase())), [query]);

  if (layout === "masonry") {
    const breakpointCols = { default: columns, 1100: Math.min(columns, 3), 700: Math.min(columns, 2), 500: 1 };
    return (
      <Masonry
        breakpointCols={breakpointCols}
        className="my-masonry-grid"
        columnClassName="my-masonry-grid_column"
      >
        {items.map((i) => (
          <div key={i.id} className="mb-4">
            <UICard
              title={i.title}
              description={i.description}
              imageUrl={i.imageUrl}
              unoptimizedImage
            />
          </div>
        ))}
      </Masonry>
    );
  }

  const gridClass =
    columns === 2 ? "grid-cols-1 sm:grid-cols-2" :
    columns === 3 ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" :
    "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";

  const containerClass = layout === "list" ? "grid grid-cols-1 gap-4" : `grid ${gridClass} gap-4`;

  return (
    <div className={containerClass}>
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


