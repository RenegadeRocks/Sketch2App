import { describe, it, expect } from "vitest";
import { ALLOWED_SHADCN, isAllowedImport } from "@/lib/allowed-components";

describe("allowed-components", () => {
  it("includes common primitives", () => {
    expect(ALLOWED_SHADCN).toContain("Button");
    expect(ALLOWED_SHADCN).toContain("Card");
    expect(ALLOWED_SHADCN).toContain("Dialog");
  });

  it("rejects hallucinated components", () => {
    expect(isAllowedImport("MagicalDialog")).toBe(false);
    expect(isAllowedImport("GlowyPanel")).toBe(false);
  });

  it("accepts whitelisted components", () => {
    expect(isAllowedImport("Button")).toBe(true);
    expect(isAllowedImport("Dialog")).toBe(true);
  });
});
