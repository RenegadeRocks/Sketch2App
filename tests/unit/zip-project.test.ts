import { describe, it, expect } from "vitest";
import { buildZipBlob } from "@/lib/zip-project";
import JSZip from "jszip";

describe("buildZipBlob", () => {
  it("includes all project files with correct paths", async () => {
    const blob = await buildZipBlob({
      pageName: "LoginPage",
      files: [
        { path: "app/page.tsx", contents: "A", role: "page" },
        { path: "components/X.tsx", contents: "B", role: "component" },
      ],
    });
    const zip = await JSZip.loadAsync(blob);
    expect(zip.file("app/page.tsx")).toBeTruthy();
    expect(zip.file("components/X.tsx")).toBeTruthy();
  });
});
