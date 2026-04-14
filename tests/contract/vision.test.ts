import { describe, it, expect, vi } from "vitest";
import { normalizePhotoToShapes } from "@/lib/pipeline/vision";
import * as or from "@/lib/openrouter";
import valid from "../fixtures/vision-valid.json";

describe("normalizePhotoToShapes", () => {
  it("parses shapes array from vision response", async () => {
    vi.spyOn(or, "callOpenRouter").mockResolvedValueOnce(JSON.stringify(valid));
    const shapes = await normalizePhotoToShapes({
      imageDataUrl: "data:image/png;base64,AAAA",
      apiKey: "x", model: "anthropic/claude-sonnet-4.6",
    });
    expect(shapes).toHaveLength(2);
    expect(shapes[0].type).toBe("geo");
  });

  it("retries once on invalid JSON, then succeeds", async () => {
    const spy = vi.spyOn(or, "callOpenRouter")
      .mockResolvedValueOnce("not json")
      .mockResolvedValueOnce(JSON.stringify(valid));
    await normalizePhotoToShapes({
      imageDataUrl: "data:image/png;base64,AAAA",
      apiKey: "x", model: "m",
    });
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it("throws when zero shapes are detected", async () => {
    vi.spyOn(or, "callOpenRouter").mockResolvedValueOnce(JSON.stringify({ shapes: [] }));
    await expect(
      normalizePhotoToShapes({ imageDataUrl: "data:image/png;base64,A", apiKey: "x", model: "m" })
    ).rejects.toThrow(/no shapes/i);
  });
});
