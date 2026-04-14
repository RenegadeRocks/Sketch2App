import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/openrouter/route";

describe("/api/openrouter POST", () => {
  const fetchSpy = vi.spyOn(globalThis, "fetch");
  beforeEach(() => { fetchSpy.mockReset(); });

  it("forwards the request to OpenRouter with correct headers", async () => {
    fetchSpy.mockResolvedValue(new Response("{\"ok\":true}", { status: 200 }));
    const req = new Request("http://localhost/api/openrouter", {
      method: "POST",
      headers: { Authorization: "Bearer sk-user-key", "content-type": "application/json" },
      body: JSON.stringify({ model: "anthropic/claude-sonnet-4.6", messages: [] }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(fetchSpy).toHaveBeenCalledOnce();
    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe("https://openrouter.ai/api/v1/chat/completions");
    const headers = init?.headers as Record<string, string>;
    expect(headers["Authorization"]).toBe("Bearer sk-user-key");
    expect(headers["HTTP-Referer"]).toBeTruthy();
    expect(headers["X-Title"]).toBe("Sketch2App");
  });

  it("returns 401 when Authorization header is missing", async () => {
    const req = new Request("http://localhost/api/openrouter", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{}",
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("propagates upstream status code on error", async () => {
    fetchSpy.mockResolvedValue(new Response("nope", { status: 402 }));
    const req = new Request("http://localhost/api/openrouter", {
      method: "POST",
      headers: { Authorization: "Bearer x", "content-type": "application/json" },
      body: "{}",
    });
    const res = await POST(req);
    expect(res.status).toBe(402);
  });
});
