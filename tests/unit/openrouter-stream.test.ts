import { describe, it, expect } from "vitest";
import { parseSseStream } from "@/lib/openrouter-stream";

function sse(lines: string[]) {
  const enc = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    start(controller) {
      for (const l of lines) controller.enqueue(enc.encode(l + "\n\n"));
      controller.close();
    },
  });
}

describe("parseSseStream", () => {
  it("yields text deltas in order", async () => {
    const stream = sse([
      'data: {"choices":[{"delta":{"content":"Hel"}}]}',
      'data: {"choices":[{"delta":{"content":"lo"}}]}',
      'data: [DONE]',
    ]);
    const chunks: string[] = [];
    for await (const c of parseSseStream(stream)) chunks.push(c);
    expect(chunks.join("")).toBe("Hello");
  });

  it("ignores malformed lines", async () => {
    const stream = sse([
      'data: {not json}',
      'data: {"choices":[{"delta":{"content":"OK"}}]}',
      'data: [DONE]',
    ]);
    const chunks: string[] = [];
    for await (const c of parseSseStream(stream)) chunks.push(c);
    expect(chunks.join("")).toBe("OK");
  });
});
