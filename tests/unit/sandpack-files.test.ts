import { describe, it, expect } from "vitest";
import { projectToSandpackFiles } from "@/lib/sandpack-files";

describe("projectToSandpackFiles", () => {
  it("maps GeneratedFile[] to Sandpack file map with base skeleton", () => {
    const project = {
      pageName: "LoginPage",
      files: [
        { path: "app/page.tsx", contents: "export default function Page(){return <div>Hi</div>}", role: "page" as const },
        { path: "components/Form.tsx", contents: "export function Form(){return <form/>}", role: "component" as const },
      ],
    };
    const files = projectToSandpackFiles(project);
    expect(files["/App.tsx"]).toBeDefined();
    expect(files["/src/page.tsx"].code).toContain("Hi");
    expect(files["/src/components/Form.tsx"].code).toContain("<form/>");
    expect(files["/package.json"]).toBeDefined();
  });
});
