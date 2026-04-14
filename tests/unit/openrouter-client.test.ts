import { describe, it, expect, vi, beforeEach } from "vitest";
import { callOpenRouter, OpenRouterError } from "@/lib/openrouter";

describe("callOpenRouter", () => {
  const fetchSpy = vi.spyOn(globalThis, "fetch");
  beforeEach(() => { fetchSpy.mockReset(); });

  it("returns parsed content on success", async () => {
    fetchSpy.mockResolvedValue(
      new Response(
        JSON.stringify({ choices: [{ message: { content: '{"ok":true}' } }] }),
        { status: 200 }
      )
    );
    const res = await callOpenRouter({
      apiKey: "sk-x", model: "x/y", messages: [{ role: "user", content: "hi" }],
    });
    expect(res).toBe('{"ok":true}');
  });

  it("throws OpenRouterError on 401", async () => {
    fetchSpy.mockResolvedValue(new Response("{}", { status: 401 }));
    await expect(
      callOpenRouter({ apiKey: "bad", model: "x", messages: [] })
    ).rejects.toThrow(OpenRouterError);
  });

  it("exposes HTTP status on error", async () => {
    fetchSpy.mockResolvedValue(new Response("{}", { status: 402 }));
    try {
      await callOpenRouter({ apiKey: "x", model: "x", messages: [] });
    } catch (e) {
      expect((e as OpenRouterError).status).toBe(402);
    }
  });
});
