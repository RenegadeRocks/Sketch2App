import { z } from "zod";

export const GeoKindSchema = z.enum([
  "rectangle", "ellipse", "diamond", "triangle",
  "pentagon", "hexagon", "star", "oval",
]);

export const TextSizeSchema = z.enum(["s", "m", "l", "xl"]);

export const GeoShapeSchema = z.object({
  type: z.literal("geo"),
  id: z.string().min(1),
  x: z.number(),
  y: z.number(),
  w: z.number().positive(),
  h: z.number().positive(),
  props: z.object({
    geo: GeoKindSchema,
    text: z.string().optional(),
  }),
});

export const TextShapeSchema = z.object({
  type: z.literal("text"),
  id: z.string().min(1),
  x: z.number(),
  y: z.number(),
  props: z.object({
    text: z.string(),
    size: TextSizeSchema,
  }),
});

export const ArrowShapeSchema = z.object({
  type: z.literal("arrow"),
  id: z.string().min(1),
  props: z.object({
    start: z.object({ boundShapeId: z.string().optional() }),
    end: z.object({ boundShapeId: z.string().optional() }),
  }),
});

export const DrawShapeSchema = z.object({
  type: z.literal("draw"),
  id: z.string().min(1),
  props: z.object({
    segments: z.array(z.array(z.object({ x: z.number(), y: z.number() }))),
  }),
});

export const CanvasShapeSchema = z.discriminatedUnion("type", [
  GeoShapeSchema, TextShapeSchema, ArrowShapeSchema, DrawShapeSchema,
]);

export const GeneratedFileSchema = z.object({
  path: z.string().min(1),
  contents: z.string().min(1),
  role: z.enum(["page", "component"]),
});

export const GeneratedProjectSchema = z
  .object({
    pageName: z.string().min(1).max(64).regex(/^[A-Z][A-Za-z0-9]*$/, "must be PascalCase"),
    files: z.array(GeneratedFileSchema).min(1),
  })
  .refine((p) => p.files.some((f) => f.role === "page"), {
    message: "must include at least one page file",
  });

export type CanvasShape = z.infer<typeof CanvasShapeSchema>;
export type GeneratedFile = z.infer<typeof GeneratedFileSchema>;
export type GeneratedProject = z.infer<typeof GeneratedProjectSchema>;
