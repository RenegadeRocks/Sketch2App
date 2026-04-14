import { ALLOWED_SHADCN } from "@/lib/allowed-components";
import type { CanvasShape, GeneratedProject } from "@/lib/schemas";
import type { OpenRouterMessage } from "@/lib/openrouter";

export interface CodegenInput {
  shapes: CanvasShape[];
  currentProject?: GeneratedProject;
  instruction?: string;
  retryNote?: string;
}

export function buildCodegenMessages(input: CodegenInput): OpenRouterMessage[] {
  const system = `You generate React code from wireframe shape data.

Output strict JSON matching this schema (no prose, no markdown):
{ "pageName": "PascalCase", "files": [{ "path": string, "contents": string, "role": "page"|"component" }] }

Rules:
- Use ONLY these shadcn components: ${ALLOWED_SHADCN.join(", ")}
- Use Tailwind classes for styling. No external CSS.
- TypeScript + JSX (".tsx") files only.
- The page file path MUST be "app/page.tsx".
- Sub-components go under "components/<Name>.tsx" and import via "@/components/<name>".
- Decompose repeated or nontrivial regions into named sub-components.
- Keep imports minimal and valid.
- Do NOT include package.json, tsconfig, or README.`;

  const user =
    input.instruction && input.currentProject
      ? `User refinement request: ${input.instruction}

Original canvas shapes:
${JSON.stringify(input.shapes)}

Current project (update this — minimal changes, preserve structure):
${JSON.stringify(input.currentProject)}${input.retryNote ? `\n\nRetry note: ${input.retryNote}` : ""}`
      : `Canvas shapes:
${JSON.stringify(input.shapes)}

Produce the full project as JSON per the schema.${input.retryNote ? `\n\nRetry note: ${input.retryNote}` : ""}`;

  return [
    { role: "system", content: system },
    { role: "user", content: user },
  ];
}
