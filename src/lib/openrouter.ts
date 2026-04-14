export type OpenRouterMessage =
  | { role: "system" | "assistant"; content: string }
  | { role: "user"; content: string | Array<
      | { type: "text"; text: string }
      | { type: "image_url"; image_url: { url: string } }
    > };

export interface CallOpenRouterOptions {
  apiKey: string;
  model: string;
  messages: OpenRouterMessage[];
  responseFormat?: "json_object" | "text";
  stream?: boolean;
}

export class OpenRouterError extends Error {
  constructor(message: string, public status: number, public body?: string) {
    super(message);
    this.name = "OpenRouterError";
  }
}

export async function callOpenRouter(opts: CallOpenRouterOptions): Promise<string> {
  const res = await fetch("/api/openrouter", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${opts.apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: opts.model,
      messages: opts.messages,
      ...(opts.responseFormat === "json_object"
        ? { response_format: { type: "json_object" } }
        : {}),
      stream: Boolean(opts.stream),
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new OpenRouterError(`OpenRouter error ${res.status}`, res.status, body);
  }
  const data = (await res.json()) as {
    choices: Array<{ message: { content: string } }>;
  };
  return data.choices[0]?.message?.content ?? "";
}
