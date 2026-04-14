"use client";
import { createContext, useCallback, useContext, useState, PropsWithChildren } from "react";
import { MODELS, DEFAULT_MODEL_ID, findModel, type ModelOption } from "@/lib/models";

interface ModelCtx {
  model: ModelOption;
  setModelById: (id: string) => void;
  models: ModelOption[];
}

const Ctx = createContext<ModelCtx | null>(null);

export function ModelProvider({ children }: PropsWithChildren) {
  const [modelId, setModelId] = useState<string>(DEFAULT_MODEL_ID);
  const setModelById = useCallback((id: string) => {
    if (!findModel(id)) throw new Error(`Unknown model: ${id}`);
    setModelId(id);
  }, []);
  const model = findModel(modelId)!;
  return <Ctx.Provider value={{ model, setModelById, models: MODELS }}>{children}</Ctx.Provider>;
}

export function useModel() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useModel must be used inside ModelProvider");
  return ctx;
}
