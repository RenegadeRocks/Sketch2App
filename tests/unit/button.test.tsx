import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Button } from "@/components/ui/button";

describe("Button (Bauhaus)", () => {
  it("primary variant has red background and hard shadow", () => {
    render(<Button variant="default">Go</Button>);
    const btn = screen.getByRole("button", { name: /go/i });
    expect(btn.className).toContain("bg-bauhaus-red");
    expect(btn.className).toContain("shadow-bauhaus");
    expect(btn.className).toContain("uppercase");
  });

  it("secondary variant has blue background", () => {
    render(<Button variant="secondary">Go</Button>);
    expect(screen.getByRole("button").className).toContain("bg-bauhaus-blue");
  });

  it("accent variant has yellow background with black text", () => {
    render(<Button variant="accent">Go</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("bg-bauhaus-yellow");
    expect(btn.className).toContain("text-bauhaus-black");
  });
});
