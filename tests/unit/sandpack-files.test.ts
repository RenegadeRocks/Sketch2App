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
    expect(files["/index.tsx"]).toBeDefined();
    expect(files["/page.tsx"].code).toContain("Hi");
    expect(files["/components/Form.tsx"].code).toContain("<form/>");
    expect(files["/package.json"]).toBeDefined();
  });

  it("injects shadcn/ui shim files so generated imports resolve in Sandpack", () => {
    const project = {
      pageName: "LoginPage",
      files: [
        {
          path: "app/page.tsx",
          contents: `import { Button } from "@/components/ui/button";\nimport { Card, CardContent } from "@/components/ui/card";\nexport default function Page(){return <Card><CardContent><Button>Go</Button></CardContent></Card>}`,
          role: "page" as const,
        },
      ],
    };
    const files = projectToSandpackFiles(project);
    expect(files["/components/ui/button.tsx"].code).toContain("export const Button");
    expect(files["/components/ui/card.tsx"].code).toContain("export const Card");
    expect(files["/components/ui/input.tsx"]).toBeDefined();
    expect(files["/components/ui/dialog.tsx"]).toBeDefined();
    expect(files["/components/ui/tabs.tsx"]).toBeDefined();
    // alias rewriting still works end-to-end
    expect(files["/page.tsx"].code).toContain(`from "/components/ui/button"`);
  });

  it("lets project files override shim files when paths collide", () => {
    const project = {
      pageName: "X",
      files: [
        {
          path: "components/ui/button.tsx",
          contents: "export const Button = () => <button>custom</button>;",
          role: "component" as const,
        },
      ],
    };
    const files = projectToSandpackFiles(project);
    expect(files["/components/ui/button.tsx"].code).toContain("custom");
  });
});
