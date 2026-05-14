import { describe, it, expect } from "vitest";
import { convertTldrawSnapshotToShapes } from "@/lib/tldraw-to-shapes";

describe("convertTldrawSnapshotToShapes", () => {
  it("extracts geo rectangle with text", () => {
    const snapshot = {
      store: {
        "shape:1": {
          id: "shape:1", typeName: "shape", type: "geo",
          x: 10, y: 20,
          props: { w: 100, h: 40, geo: "rectangle", text: "Header" },
        },
      },
    };
    const shapes = convertTldrawSnapshotToShapes(snapshot);
    expect(shapes).toHaveLength(1);
    expect(shapes[0]).toMatchObject({
      type: "geo", id: "shape:1", x: 10, y: 20, w: 100, h: 40,
      props: { geo: "rectangle", text: "Header" },
    });
  });

  it("extracts geo label from tldraw 4.x richText prop", () => {
    const snapshot = {
      store: {
        "shape:1": {
          id: "shape:1", typeName: "shape", type: "geo",
          x: 0, y: 0,
          props: {
            w: 100, h: 40, geo: "rectangle",
            richText: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Sign in" }] }] },
          },
        },
      },
    };
    const shapes = convertTldrawSnapshotToShapes(snapshot);
    expect(shapes[0]).toMatchObject({ type: "geo", props: { geo: "rectangle", text: "Sign in" } });
  });

  it("extracts text shape content from richText", () => {
    const snapshot = {
      store: {
        "shape:1": {
          id: "shape:1", typeName: "shape", type: "text",
          x: 0, y: 0,
          props: {
            size: "l",
            richText: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Welcome" }] }] },
          },
        },
      },
    };
    const shapes = convertTldrawSnapshotToShapes(snapshot);
    expect(shapes[0]).toMatchObject({ type: "text", props: { text: "Welcome", size: "l" } });
  });

  it("skips non-shape records", () => {
    const snapshot = {
      store: {
        "document:doc": { typeName: "document" },
        "shape:1": { id: "shape:1", typeName: "shape", type: "text", x: 0, y: 0, props: { text: "Hi", size: "m" } },
      },
    };
    const shapes = convertTldrawSnapshotToShapes(snapshot);
    expect(shapes).toHaveLength(1);
    expect(shapes[0].type).toBe("text");
  });
});
