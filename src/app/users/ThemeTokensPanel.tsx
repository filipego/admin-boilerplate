"use client";

import UIButton from "@/components/common/UIButton";
import { useEffect, useState } from "react";

type Tokens = {
  radius: string;
  cardShadow: string;
};

export default function ThemeTokensPanel() {
  const [tokens, setTokens] = useState<Tokens>({ radius: "10px", cardShadow: "var(--shadow-card)" });

  useEffect(() => {
    const root = document.documentElement;
    setTokens({
      radius: getComputedStyle(root).getPropertyValue("--radius").trim() || "10px",
      cardShadow: getComputedStyle(root).getPropertyValue("--shadow-card").trim() || "var(--shadow-card)",
    });
  }, []);

  const apply = () => {
    const root = document.documentElement;
    root.style.setProperty("--radius", tokens.radius);
    root.style.setProperty("--shadow-card", tokens.cardShadow);
  };

  return (
    <div className="mt-6 border-t pt-4">
      <div className="text-sm font-medium mb-2">Theme Tokens</div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="grid gap-1">
          <label className="text-sm" htmlFor="radius">Radius (e.g., 0px, 8px, 12px)</label>
          <input id="radius" className="px-3 py-2 rounded-md border bg-background" value={tokens.radius} onChange={(e) => setTokens((t) => ({ ...t, radius: e.target.value }))} />
        </div>
        <div className="grid gap-1">
          <label className="text-sm" htmlFor="shadow">Card Shadow (CSS shadow)</label>
          <input id="shadow" className="px-3 py-2 rounded-md border bg-background" value={tokens.cardShadow} onChange={(e) => setTokens((t) => ({ ...t, cardShadow: e.target.value }))} />
        </div>
      </div>
      <div className="mt-3 flex justify-end">
        <UIButton onClick={apply}>Apply</UIButton>
      </div>
    </div>
  );
}


