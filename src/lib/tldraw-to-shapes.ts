import type { CanvasShape } from "@/lib/schemas";

interface TldrawSnapshot {
  store: Record<string, any>;
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
          props: { geo: record.props?.geo ?? "rectangle", text: record.props?.text || undefined },
        });
        break;
      case "text":
        out.push({
          type: "text", id: record.id,
          x: record.x ?? 0, y: record.y ?? 0,
          props: { text: record.props?.text ?? "", size: record.props?.size ?? "m" },
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
