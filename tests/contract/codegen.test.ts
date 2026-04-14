import { describe, it, expect, vi } from "vitest";
import { runCodegen } from "@/lib/pipeline/codegen";
import * as or from "@/lib/openrouter";
import valid from "../fixtures/codegen-valid.json";
import invalid from "../fixtures/codegen-invalid.json";

describe("runCodegen", () => {
  it("returns a parsed project on valid response", async () => {
    vi.spyOn(or, "callOpenRouter").mockResolvedValueOnce(JSON.stringify(valid));
    const res = await runCodegen({ shapes: [], apiKey: "x", model: "m" });
    expect(res.pageName).toBe("LoginPage");
    expect(res.files).toHaveLength(2);
  });

  it("retries once on invalid JSON structure, then succeeds", async () => {
    const spy = vi.spyOn(or, "callOpenRouter")
      .mockResolvedValueOnce(JSON.stringify(invalid))
      .mockResolvedValueOnce(JSON.stringify(valid));
    const res = await runCodegen({ shapes: [], apiKey: "x", model: "m" });
    expect(spy).toHaveBeenCalledTimes(2);
    expect(res.pageName).toBe("LoginPage");
  });

  it("throws after second failure", async () => {
    vi.spyOn(or, "callOpenRouter").mockResolvedValue(JSON.stringify(invalid));
    await expect(runCodegen({ shapes: [], apiKey: "x", model: "m" })).rejects.toThrow(/codegen/i);
  });

  it("throws when content is not JSON at all", async () => {
    vi.spyOn(or, "callOpenRouter").mockResolvedValue("not json");
    await expect(runCodegen({ shapes: [], apiKey: "x", model: "m" })).rejects.toThrow();
  });
});
