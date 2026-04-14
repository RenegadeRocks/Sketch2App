"use client";
import { Tldraw, Editor } from "@tldraw/tldraw";
import "@tldraw/tldraw/tldraw.css";
import { useCallback } from "react";
import { convertTldrawSnapshotToShapes } from "@/lib/tldraw-to-shapes";
import { useProject } from "@/contexts/project-context";

export function TldrawCanvas() {
  const { setCanvasShapes } = useProject();

  const onMount = useCallback((editor: Editor) => {
    (window as any).__TLDRAW_EDITOR__ = editor;
    const sync = () => {
      const snapshot = editor.getSnapshot();
      setCanvasShapes(convertTldrawSnapshotToShapes({ store: snapshot.document.store as any }));
    };
    sync();
    return editor.store.listen(() => sync(), { scope: "document", source: "user" });
  }, [setCanvasShapes]);

  return (
    <div className="h-full w-full border-2 border-bauhaus-black bg-white">
      <Tldraw onMount={onMount} />
    </div>
  );
}
