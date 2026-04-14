import { describe, it, expect } from "vitest";
import {
  CanvasShapeSchema,
  GeneratedProjectSchema,
  GeneratedFileSchema,
} from "@/lib/schemas";

describe("CanvasShapeSchema", () => {
  it("accepts a valid geo rectangle", () => {
    const parsed = CanvasShapeSchema.parse({
      type: "geo",
      id: "s1",
      x: 10, y: 20, w: 100, h: 40,
      props: { geo: "rectangle", text: "Login" },
    });
    expect(parsed.type).toBe("geo");
  });

  it("rejects a geo shape missing w/h", () => {
    expect(() =>
      CanvasShapeSchema.parse({ type: "geo", id: "s1", x: 0, y: 0, props: { geo: "rectangle" } })
    ).toThrow();
  });

  it("accepts a text shape", () => {
    const parsed = CanvasShapeSchema.parse({
      type: "text", id: "t1", x: 0, y: 0,
      props: { text: "Hi", size: "m" },
    });
    expect(parsed.type).toBe("text");
  });

  it("rejects unknown shape type", () => {
    expect(() =>
      CanvasShapeSchema.parse({ type: "bogus", id: "x", x: 0, y: 0, props: {} })
    ).toThrow();
  });
});

describe("GeneratedProjectSchema", () => {
  it("accepts a valid project with exactly one page file", () => {
    const parsed = GeneratedProjectSchema.parse({
      pageName: "LoginPage",
      files: [
        { path: "app/page.tsx", contents: "export default function Page(){return null}", role: "page" },
        { path: "components/Form.tsx", contents: "export function Form(){return null}", role: "component" },
      ],
    });
    expect(parsed.files).toHaveLength(2);
  });

  it("rejects project with no page file", () => {
    expect(() =>
      GeneratedProjectSchema.parse({
        pageName: "X",
        files: [{ path: "components/X.tsx", contents: "x", role: "component" }],
      })
    ).toThrow(/page file/);
  });

  it("rejects invalid pageName (starts lowercase)", () => {
    expect(() =>
      GeneratedProjectSchema.parse({
        pageName: "loginPage",
        files: [{ path: "app/page.tsx", contents: "x", role: "page" }],
      })
    ).toThrow();
  });

  it("rejects empty files array", () => {
    expect(() =>
      GeneratedProjectSchema.parse({ pageName: "X", files: [] })
    ).toThrow();
  });
});

describe("GeneratedFileSchema", () => {
  it("rejects file with empty contents", () => {
    expect(() =>
      GeneratedFileSchema.parse({ path: "x.tsx", contents: "", role: "page" })
    ).toThrow();
  });
});
