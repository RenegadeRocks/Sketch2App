import { describe, it, expect } from "vitest";
import { buildCodegenMessages } from "@/lib/prompts/codegen";

describe("buildCodegenMessages", () => {
  it("embeds the canvas JSON and component whitelist", () => {
    const msgs = buildCodegenMessages({
      shapes: [{ type: "geo", id: "s1", x: 0, y: 0, w: 10, h: 10, props: { geo: "rectangle", text: "Hi" } }],
    });
    expect(msgs.length).toBeGreaterThanOrEqual(2);
    const systemText = msgs[0].content as string;
    expect(systemText).toMatch(/shadcn/i);
    expect(systemText).toMatch(/Button/);
    const userText = msgs[1].content as string;
    expect(userText).toContain('"type":"geo"');
  });

  it("includes prior project when iterating", () => {
    const msgs = buildCodegenMessages({
      shapes: [],
      currentProject: { pageName: "LoginPage", files: [{ path: "app/page.tsx", contents: "x", role: "page" }] },
      instruction: "make the header red",
    });
    const text = (msgs[1].content as string);
    expect(text).toContain("make the header red");
    expect(text).toContain("LoginPage");
  });
});
