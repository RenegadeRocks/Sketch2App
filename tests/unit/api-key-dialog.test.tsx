import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ApiKeyDialog } from "@/components/api-key-dialog";
import { ApiKeyProvider } from "@/contexts/api-key-context";

describe("ApiKeyDialog", () => {
  it("submits and persists the key", async () => {
    const user = userEvent.setup();
    render(
      <ApiKeyProvider>
        <ApiKeyDialog open onOpenChange={() => {}} />
      </ApiKeyProvider>
    );
    const input = screen.getByLabelText(/openrouter api key/i);
    await user.type(input, "sk-or-test123");
    await user.click(screen.getByRole("button", { name: /save/i }));
    expect(localStorage.getItem("sketch2app:or-key")).toBe("sk-or-test123");
  });
});
