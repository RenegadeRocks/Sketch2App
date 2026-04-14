import { describe, it, expect, vi } from "vitest";
import { runIteration } from "@/lib/pipeline/iterate";
import * as or from "@/lib/openrouter";
import valid from "../fixtures/codegen-valid.json";

describe("runIteration", () => {
  it("returns updated project when model responds well", async () => {
    vi.spyOn(or, "callOpenRouter").mockResolvedValueOnce(JSON.stringify(valid));
    const res = await runIteration({
      instruction: "make header red",
      currentProject: { pageName: "Old", files: [{ path: "app/page.tsx", contents: "x", role: "page" }] },
      canvasShapes: [],
      apiKey: "x", model: "m",
    });
    expect(res.pageName).toBe("LoginPage");
  });

  it("falls back to previous page file when model omits one", async () => {
    const onlyComponent = {
      pageName: "LoginPage",
      files: [{ path: "components/Form.tsx", contents: "x", role: "component" }],
    };
    vi.spyOn(or, "callOpenRouter").mockResolvedValueOnce(JSON.stringify(onlyComponent));
    const current = {
      pageName: "LoginPage",
      files: [
        { path: "app/page.tsx", contents: "original", role: "page" as const },
        { path: "components/Old.tsx", contents: "old", role: "component" as const },
      ],
    };
    const res = await runIteration({
      instruction: "tweak", currentProject: current, canvasShapes: [], apiKey: "x", model: "m",
    });
    expect(res.files.find(f => f.role === "page")?.contents).toBe("original");
    expect(res.files.find(f => f.path === "components/Form.tsx")).toBeDefined();
  });
});
