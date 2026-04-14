import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { ProjectProvider, useProject } from "@/contexts/project-context";
import { PropsWithChildren } from "react";

const wrapper = ({ children }: PropsWithChildren) => <ProjectProvider>{children}</ProjectProvider>;

describe("ProjectContext", () => {
  it("starts empty", () => {
    const { result } = renderHook(() => useProject(), { wrapper });
    expect(result.current.project).toBeNull();
    expect(result.current.history).toHaveLength(0);
    expect(result.current.canvasShapes).toHaveLength(0);
  });

  it("setProject pushes previous to history", () => {
    const { result } = renderHook(() => useProject(), { wrapper });
    const p1 = { pageName: "A", files: [{ path: "app/page.tsx", contents: "1", role: "page" as const }] };
    const p2 = { pageName: "B", files: [{ path: "app/page.tsx", contents: "2", role: "page" as const }] };
    act(() => result.current.setProject(p1));
    act(() => result.current.setProject(p2));
    expect(result.current.project?.pageName).toBe("B");
    expect(result.current.history).toHaveLength(1);
    expect(result.current.history[0].pageName).toBe("A");
  });

  it("revert pops history back", () => {
    const { result } = renderHook(() => useProject(), { wrapper });
    const p1 = { pageName: "A", files: [{ path: "app/page.tsx", contents: "1", role: "page" as const }] };
    const p2 = { pageName: "B", files: [{ path: "app/page.tsx", contents: "2", role: "page" as const }] };
    act(() => result.current.setProject(p1));
    act(() => result.current.setProject(p2));
    act(() => result.current.revert());
    expect(result.current.project?.pageName).toBe("A");
    expect(result.current.history).toHaveLength(0);
  });

  it("appendChatMessage adds and caps at 5 turns", () => {
    const { result } = renderHook(() => useProject(), { wrapper });
    for (let i = 0; i < 7; i++) {
      act(() => result.current.appendChatMessage({ role: "user", content: `msg${i}` }));
    }
    expect(result.current.chatHistory).toHaveLength(5);
    expect(result.current.chatHistory[0].content).toBe("msg2");
  });

  it("canvasDirty flag", () => {
    const { result } = renderHook(() => useProject(), { wrapper });
    act(() => result.current.setCanvasShapes([{ type: "geo", id: "x", x:0, y:0, w:1, h:1, props: { geo: "rectangle" } }]));
    expect(result.current.canvasDirty).toBe(true);
    act(() => result.current.markCanvasClean());
    expect(result.current.canvasDirty).toBe(false);
  });
});
