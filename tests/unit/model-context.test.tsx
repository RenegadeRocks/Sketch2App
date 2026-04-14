import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { ModelProvider, useModel } from "@/contexts/model-context";
import { PropsWithChildren } from "react";

const wrapper = ({ children }: PropsWithChildren) => <ModelProvider>{children}</ModelProvider>;

describe("ModelContext", () => {
  it("defaults to Claude Sonnet 4.6", () => {
    const { result } = renderHook(() => useModel(), { wrapper });
    expect(result.current.model.id).toBe("anthropic/claude-sonnet-4.6");
  });

  it("setModelById switches to a valid model", () => {
    const { result } = renderHook(() => useModel(), { wrapper });
    act(() => result.current.setModelById("openai/gpt-4o"));
    expect(result.current.model.id).toBe("openai/gpt-4o");
  });

  it("throws for unknown model id", () => {
    const { result } = renderHook(() => useModel(), { wrapper });
    expect(() => act(() => result.current.setModelById("bogus/model"))).toThrow();
  });
});
