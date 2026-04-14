import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ModelPicker } from "@/components/model-picker";
import { ModelProvider } from "@/contexts/model-context";

describe("ModelPicker", () => {
  it("shows the current model label", () => {
    render(<ModelProvider><ModelPicker /></ModelProvider>);
    expect(screen.getByRole("combobox")).toHaveTextContent(/claude sonnet/i);
  });

  it("lets user pick a different model", async () => {
    const user = userEvent.setup();
    render(<ModelProvider><ModelPicker /></ModelProvider>);
    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByRole("option", { name: /gpt-4o/i }));
    expect(screen.getByRole("combobox")).toHaveTextContent(/gpt-4o/i);
  });
});
