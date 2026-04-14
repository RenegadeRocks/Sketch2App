import { describe, it, expect } from "vitest";
import { shouldCompress } from "@/lib/image-compress";

describe("shouldCompress", () => {
  it("returns true for files larger than 2MB", () => {
    expect(shouldCompress(3_000_000)).toBe(true);
  });
  it("returns false for small files", () => {
    expect(shouldCompress(500_000)).toBe(false);
  });
});
