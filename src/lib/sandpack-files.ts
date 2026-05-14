import type { GeneratedProject } from "@/lib/schemas";
import { shadcnShimFiles } from "@/lib/sandpack-shadcn-shims";

type SandpackFiles = Record<string, { code: string }>;

const INDEX_HTML = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Preview</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      body { margin: 0; font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }
    </style>
  </head>
  <body><div id="root"></div></body>
</html>`;

const INDEX_ENTRY = `
import React from "react";
import { createRoot } from "react-dom/client";
import Page from "./page";

if (!document.getElementById("__sketch2app_tw")) {
  const s = document.createElement("script");
  s.id = "__sketch2app_tw";
  s.src = "https://cdn.tailwindcss.com";
  document.head.appendChild(s);
}
document.body.style.margin = "0";
document.documentElement.style.fontFamily = 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

const el = document.getElementById("root");
if (el) createRoot(el).render(<Page />);
`.trim();

const BASE_PKG = {
  name: "sketch2app-preview",
  main: "/index.tsx",
  dependencies: {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "lucide-react": "^0.454.0",
  },
};

function rewriteAliasImports(code: string): string {
  return code.replace(/(from\s+['"])@\/([^'"]+)(['"])/g, "$1/$2$3")
             .replace(/(import\s*\(\s*['"])@\/([^'"]+)(['"])/g, "$1/$2$3");
}

export function projectToSandpackFiles(project: GeneratedProject): SandpackFiles {
  const files: SandpackFiles = {
    "/index.tsx": { code: INDEX_ENTRY },
    "/public/index.html": { code: INDEX_HTML },
    "/package.json": { code: JSON.stringify(BASE_PKG, null, 2) },
    ...shadcnShimFiles(),
  };
  for (const f of project.files) {
    const sandpackPath = "/" + f.path.replace(/^app\//, "");
    files[sandpackPath] = { code: rewriteAliasImports(f.contents) };
  }
  return files;
}
