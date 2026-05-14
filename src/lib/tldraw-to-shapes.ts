import type { CanvasShape } from "@/lib/schemas";

interface TldrawSnapshot {
  store: Record<string, any>;
}

interface TipTapNode {
  type?: string;
  text?: string;
  content?: TipTapNode[];
}

function extractText(value: unknown): string | undefined {
  if (typeof value === "string") {
    return value.trim() || undefined;
  }
  if (!value || typeof value !== "object") return undefined;
  const v = value as TipTapNode;
  if (v.type === "text" && typeof v.text === "string") {
    return v.text || undefined;
  }
  if (Array.isArray(v.content)) {
    const parts: string[] = [];
    for (const child of v.content) {
      const t = extractText(child);
      if (t) parts.push(t);
    }
    const joined = parts.join("\n").trim();
    return joined || undefined;
  }
  return undefined;
}

function resolveText(props: any): string | undefined {
  return extractText(props?.text) ?? extractText(props?.richText);
}

export function convertTldrawSnapshotToShapes(snapshot: TldrawSnapshot): CanvasShape[] {
  const out: CanvasShape[] = [];
  for (const record of Object.values(snapshot.store ?? {})) {
    if (!record || record.typeName !== "shape") continue;
    switch (record.type) {
      case "geo":
        out.push({
          type: "geo", id: record.id,
          x: record.x ?? 0, y: record.y ?? 0,
          w: record.props?.w ?? 1, h: record.props?.h ?? 1,
          props: { geo: record.props?.geo ?? "rectangle", text: resolveText(record.props) },
        });
        break;
      case "text":
        out.push({
          type: "text", id: record.id,
          x: record.x ?? 0, y: record.y ?? 0,
          props: { text: resolveText(record.props) ?? "", size: record.props?.size ?? "m" },
        });
        break;
      case "arrow":
        out.push({
          type: "arrow", id: record.id,
          props: {
            start: { boundShapeId: record.props?.start?.boundShapeId },
            end: { boundShapeId: record.props?.end?.boundShapeId },
          },
        });
        break;
      case "draw":
        out.push({
          type: "draw", id: record.id,
          props: { segments: record.props?.segments?.map((s: any) => s.points ?? s) ?? [] },
        });
        break;
    }
  }
  return out;
}
