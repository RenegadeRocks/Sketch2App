"use client";
import { Wand2 } from "lucide-react";
import { SAMPLE_SKETCHES, findSample } from "@/lib/sample-sketches";

export function SampleSketches() {
  const load = (id: string) => {
    const editor = (window as { __TLDRAW_EDITOR__?: { [k: string]: unknown } }).__TLDRAW_EDITOR__;
    if (!editor) return;
    const sample = findSample(id);
    if (!sample) return;
    const e = editor as any;
    const existing = e.getCurrentPageShapes?.() ?? [];
    if (existing.length) {
      e.deleteShapes(existing.map((s: any) => s.id));
    }
    e.createShapes(sample.shapes);
    try {
      e.zoomToFit?.();
      e.zoomToContent?.();
    } catch { /* tldraw API surface varies */ }
  };
  return (
    <div className="border-b-2 border-bauhaus-black bg-muted px-3 py-2 flex items-center gap-2 flex-wrap">
      <span className="bauhaus-label opacity-70 flex items-center gap-1">
        <Wand2 className="w-3 h-3" strokeWidth={3} /> Try a sample
      </span>
      {SAMPLE_SKETCHES.map((s) => (
        <button
          key={s.id}
          onClick={() => load(s.id)}
          title={s.description}
          className="text-xs font-bold uppercase tracking-wider px-2 py-1 border-2 border-bauhaus-black bg-white hover:bg-bauhaus-yellow transition-colors cursor-pointer"
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
