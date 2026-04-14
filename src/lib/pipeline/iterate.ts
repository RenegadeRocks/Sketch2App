import { runCodegen } from "@/lib/pipeline/codegen";
import type { CanvasShape, GeneratedProject } from "@/lib/schemas";

export interface IterateOptions {
  instruction: string;
  currentProject: GeneratedProject;
  canvasShapes: CanvasShape[];
  apiKey: string;
  model: string;
}

export async function runIteration(opts: IterateOptions): Promise<GeneratedProject> {
  return runCodegen({
    shapes: opts.canvasShapes,
    apiKey: opts.apiKey,
    model: opts.model,
    currentProject: opts.currentProject,
    instruction: opts.instruction,
  });
}

export function mergeWithPreservedPage(
  updated: { pageName: string; files: GeneratedProject["files"] },
  previous: GeneratedProject
): GeneratedProject {
  const hasPage = updated.files.some((f) => f.role === "page");
  if (hasPage) return updated as GeneratedProject;
  const prevPage = previous.files.find((f) => f.role === "page");
  if (!prevPage) return updated as GeneratedProject;
  return { pageName: updated.pageName, files: [prevPage, ...updated.files] };
}
