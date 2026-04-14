import { createParser, EventSourceMessage } from "eventsource-parser";

export async function* parseSseStream(
  stream: ReadableStream<Uint8Array>
): AsyncGenerator<string, void, void> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  const queue: string[] = [];
  let done = false;

  const parser = createParser({
    onEvent(event: EventSourceMessage) {
      if (event.data === "[DONE]") return;
      try {
        const parsed = JSON.parse(event.data);
        const delta = parsed?.choices?.[0]?.delta?.content;
        if (typeof delta === "string") queue.push(delta);
      } catch {
        // skip malformed
      }
    },
  });

  while (!done) {
    const { value, done: d } = await reader.read();
    done = d;
    if (value) parser.feed(decoder.decode(value, { stream: true }));
    while (queue.length) yield queue.shift()!;
  }
}
