import type { OpenRouterMessage } from "@/lib/openrouter";

export function buildVisionMessages(imageDataUrl: string): OpenRouterMessage[] {
  const system = `You are a wireframe interpreter. Look at the image and identify each hand-drawn element.

Return strict JSON (no prose, no markdown):
{ "shapes": [
    { "type": "geo", "id": string, "x": number, "y": number, "w": number, "h": number,
      "props": { "geo": "rectangle"|"ellipse"|"diamond"|"triangle"|"pentagon"|"hexagon"|"star"|"oval", "text"?: string } }
  | { "type": "text", "id": string, "x": number, "y": number, "props": { "text": string, "size": "s"|"m"|"l"|"xl" } }
  | { "type": "arrow", "id": string, "props": { "start": { "boundShapeId"?: string }, "end": { "boundShapeId"?: string } } }
] }

Estimate positions and sizes on a 1024x768 canvas. Ignore shading and noise. Give each shape a unique id.`;
  return [
    { role: "system", content: system },
    { role: "user", content: [
        { type: "text", text: "Identify the wireframe elements in this image." },
        { type: "image_url", image_url: { url: imageDataUrl } },
      ] },
  ];
}
