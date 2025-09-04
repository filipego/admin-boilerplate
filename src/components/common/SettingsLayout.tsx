"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Heading } from "@/components/common/Heading";
import { showSaved } from "@/lib/toast";

type SettingsSection = {
  id: string;
  title: string;
  content: React.ReactNode;
};

export default function SettingsLayout({ sections, storageKey = "settings-autosave", className }: { sections: SettingsSection[]; storageKey?: string; className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(sections[0]?.id);
  const [isScrolling, setIsScrolling] = useState(false);

  // Observe headings relative to viewport (page scroll) to highlight active link
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    const headings = Array.from(root.querySelectorAll<HTMLDivElement>("[data-settings-section]"));
    const observer = new IntersectionObserver(
      (entries) => {
        if (isScrolling) return;
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target) setActive((visible.target as HTMLElement).id);
      },
      { root: null, rootMargin: "-40% 0px -50% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    headings.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sections, isScrolling]);

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
          values[el.name] = String(el.value ?? "");
        }
      });
      localStorage.setItem(storageKey, JSON.stringify(values));
      showSaved("Autosaved");
    };
    const options: AddEventListenerOptions = { passive: true };
    root.addEventListener("change", handler, options);
    root.addEventListener("input", handler, options);
    return () => {
      root.removeEventListener("change", handler);
      root.removeEventListener("input", handler);
    };
  }, [storageKey]);

  const nav = useMemo(() => sections.map((s) => ({ id: s.id, title: s.title })), [sections]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    setIsScrolling(true);
    const SCROLL_OFFSET = 80; // sticky header height
    const top = el.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET;
    window.scrollTo({ top, behavior: "smooth" });
    // release flag after a short delay
    window.setTimeout(() => setIsScrolling(false), 400);
  };

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6", className)}>
      <aside className="md:sticky md:top-16 self-start">
        <ul className="space-y-1">
          {nav.map((n) => (
            <li key={n.id}>
              <a
                href={`#${n.id}`}
                onClick={(e) => { e.preventDefault(); scrollToSection(n.id); }}
                className={cn("block rounded-md px-3 py-2 text-sm hover:bg-accent", active === n.id && "bg-accent text-accent-foreground")}
              >
                {n.title}
              </a>
            </li>
          ))}
        </ul>
      </aside>
      <div ref={containerRef} className="space-y-8">
        {sections.map((s) => (
          <section key={s.id} id={s.id} data-settings-section className="scroll-mt-24">
            <Heading as="h3" size="sm" className="mb-2">{s.title}</Heading>
            <div className="rounded-lg border p-4 bg-card">{s.content}</div>
          </section>
        ))}
      </div>
    </div>
  );
}

