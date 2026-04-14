import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { ApiKeyProvider, useApiKey } from "@/contexts/api-key-context";
import { PropsWithChildren } from "react";

const wrapper = ({ children }: PropsWithChildren) => <ApiKeyProvider>{children}</ApiKeyProvider>;

describe("ApiKeyContext", () => {
  beforeEach(() => localStorage.clear());

  it("initial key is null", () => {
    const { result } = renderHook(() => useApiKey(), { wrapper });
    expect(result.current.apiKey).toBeNull();
  });

  it("setApiKey persists to localStorage", () => {
    const { result } = renderHook(() => useApiKey(), { wrapper });
    act(() => result.current.setApiKey("sk-test"));
    expect(result.current.apiKey).toBe("sk-test");
    expect(localStorage.getItem("sketch2app:or-key")).toBe("sk-test");
  });

  it("clearApiKey removes the key", () => {
    localStorage.setItem("sketch2app:or-key", "sk-existing");
    const { result } = renderHook(() => useApiKey(), { wrapper });
    act(() => result.current.clearApiKey());
    expect(result.current.apiKey).toBeNull();
    expect(localStorage.getItem("sketch2app:or-key")).toBeNull();
  });
});
