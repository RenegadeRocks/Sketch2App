"use client";
import { createContext, useCallback, useContext, useState, PropsWithChildren } from "react";
import type { CanvasShape, GeneratedProject } from "@/lib/schemas";

export interface ChatMessage { role: "user" | "assistant"; content: string }

interface ProjectCtx {
  project: GeneratedProject | null;
  setProject: (p: GeneratedProject) => void;
  history: GeneratedProject[];
  revert: () => void;
  chatHistory: ChatMessage[];
  appendChatMessage: (m: ChatMessage) => void;
  canvasShapes: CanvasShape[];
  setCanvasShapes: (s: CanvasShape[]) => void;
  canvasDirty: boolean;
  markCanvasClean: () => void;
  reset: () => void;
}

const Ctx = createContext<ProjectCtx | null>(null);
const MAX_CHAT_TURNS = 5;

export function ProjectProvider({ children }: PropsWithChildren) {
  const [project, setProjectState] = useState<GeneratedProject | null>(null);
  const [history, setHistory] = useState<GeneratedProject[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [canvasShapes, setCanvasShapesState] = useState<CanvasShape[]>([]);
  const [canvasDirty, setCanvasDirty] = useState(false);

  const setProject = useCallback((p: GeneratedProject) => {
    setProjectState((prev) => {
      if (prev) setHistory((h) => [...h, prev]);
      return p;
    });
  }, []);

  const revert = useCallback(() => {
    setHistory((h) => {
      if (h.length === 0) return h;
      const previous = h[h.length - 1];
      setProjectState(previous);
      return h.slice(0, -1);
    });
  }, []);

  const appendChatMessage = useCallback((m: ChatMessage) => {
    setChatHistory((prev) => [...prev, m].slice(-MAX_CHAT_TURNS));
  }, []);

  const setCanvasShapes = useCallback((s: CanvasShape[]) => {
    setCanvasShapesState(s);
    setCanvasDirty(true);
  }, []);

  const markCanvasClean = useCallback(() => setCanvasDirty(false), []);

  const reset = useCallback(() => {
    setProjectState(null);
    setHistory([]);
    setChatHistory([]);
    setCanvasShapesState([]);
    setCanvasDirty(false);
  }, []);

  return (
    <Ctx.Provider value={{
      project, setProject, history, revert,
      chatHistory, appendChatMessage,
      canvasShapes, setCanvasShapes, canvasDirty, markCanvasClean,
      reset,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useProject() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useProject must be used inside ProjectProvider");
  return ctx;
}
