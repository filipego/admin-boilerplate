"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { showSaved } from "@/lib/toast";

type SettingsSection = {
  id: string;
  title: string;
  content: React.ReactNode;
};

export default function SettingsLayout({ sections, storageKey = "settings-autosave", className }: { sections: SettingsSection[]; storageKey?: string; className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(sections[0]?.id);

  // Observe headings to highlight active link
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    const headings = Array.from(root.querySelectorAll<HTMLDivElement>("[data-settings-section]"));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target) setActive((visible.target as HTMLElement).id);
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    headings.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sections]);

  // Lightweight autosave for inputs inside the content
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    const handler = () => {
      const values: Record<string, string> = {};
      const inputs = root.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>("input[name], textarea[name], select[name]");
      inputs.forEach((el) => {
        if (el instanceof HTMLInputElement && el.type === "checkbox") {
          values[el.name] = el.checked ? "true" : "false";
        } else {
          values[el.name] = String((el as any).value ?? "");
        }
      });
      localStorage.setItem(storageKey, JSON.stringify(values));
      showSaved("Autosaved");
    };
    root.addEventListener("change", handler, { passive: true } as any);
    root.addEventListener("input", handler, { passive: true } as any);
    return () => {
      root.removeEventListener("change", handler as any);
      root.removeEventListener("input", handler as any);
    };
  }, [storageKey]);

  const nav = useMemo(() => sections.map((s) => ({ id: s.id, title: s.title })), [sections]);

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6", className)}>
      <aside className="md:sticky md:top-16 self-start">
        <ul className="space-y-1">
          {nav.map((n) => (
            <li key={n.id}>
              <a href={`#${n.id}`} className={cn("block rounded-md px-3 py-2 text-sm hover:bg-accent", active === n.id && "bg-accent text-accent-foreground")}>{n.title}</a>
            </li>
          ))}
        </ul>
      </aside>
      <div ref={containerRef} className="space-y-8">
        {sections.map((s) => (
          <section key={s.id} id={s.id} data-settings-section>
            <h3 className="text-sm font-medium mb-2">{s.title}</h3>
            <div className="rounded-lg border p-4 bg-card">{s.content}</div>
          </section>
        ))}
      </div>
    </div>
  );
}


