import { z } from "zod";
import { CanvasShapeSchema, type CanvasShape } from "@/lib/schemas";
import { buildVisionMessages } from "@/lib/prompts/vision";
import { callOpenRouter } from "@/lib/openrouter";
import { extractJson } from "@/lib/extract-json";

export interface NormalizePhotoOptions {
  imageDataUrl: string;
  apiKey: string;
  model: string;
}

const VisionResponseSchema = z.object({ shapes: z.array(CanvasShapeSchema) });

export class VisionError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = "VisionError";
  }
}

async function attempt(opts: NormalizePhotoOptions): Promise<CanvasShape[]> {
  const messages = buildVisionMessages(opts.imageDataUrl);
  const content = await callOpenRouter({
    apiKey: opts.apiKey, model: opts.model, messages, responseFormat: "json_object",
  });
  const parsed = VisionResponseSchema.parse(extractJson(content));
  if (parsed.shapes.length === 0) throw new VisionError("no shapes detected");
  return parsed.shapes;
}

export async function normalizePhotoToShapes(opts: NormalizePhotoOptions): Promise<CanvasShape[]> {
  try {
    return await attempt(opts);
  } catch (firstErr) {
    if (firstErr instanceof VisionError) throw firstErr;
    try {
      return await attempt(opts);
    } catch (secondErr) {
      throw new VisionError(`vision failed after retry: ${(secondErr as Error).message}`, secondErr);
    }
  }
}
