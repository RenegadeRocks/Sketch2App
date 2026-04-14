"use client";
import { createContext, useCallback, useContext, useEffect, useState, PropsWithChildren } from "react";

const STORAGE_KEY = "sketch2app:or-key";

interface ApiKeyCtx {
  apiKey: string | null;
  setApiKey: (key: string) => void;
  clearApiKey: () => void;
}

const Ctx = createContext<ApiKeyCtx | null>(null);

export function ApiKeyProvider({ children }: PropsWithChildren) {
  const [apiKey, setApiKeyState] = useState<string | null>(null);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (stored) setApiKeyState(stored);
  }, []);

  const setApiKey = useCallback((key: string) => {
    localStorage.setItem(STORAGE_KEY, key);
    setApiKeyState(key);
  }, []);

  const clearApiKey = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setApiKeyState(null);
  }, []);

  return <Ctx.Provider value={{ apiKey, setApiKey, clearApiKey }}>{children}</Ctx.Provider>;
}

export function useApiKey() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApiKey must be used inside ApiKeyProvider");
  return ctx;
}
