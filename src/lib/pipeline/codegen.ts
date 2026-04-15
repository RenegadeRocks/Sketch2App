import { GeneratedProjectSchema, type CanvasShape, type GeneratedProject } from "@/lib/schemas";
import { buildCodegenMessages } from "@/lib/prompts/codegen";
import { callOpenRouter } from "@/lib/openrouter";
import { extractJson } from "@/lib/extract-json";

export interface RunCodegenOptions {
  shapes: CanvasShape[];
  apiKey: string;
  model: string;
  currentProject?: GeneratedProject;
  instruction?: string;
}

export class CodegenError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = "CodegenError";
  }
}

async function attempt(opts: RunCodegenOptions, retryNote?: string): Promise<GeneratedProject> {
  const messages = buildCodegenMessages({
    shapes: opts.shapes,
    currentProject: opts.currentProject,
    instruction: opts.instruction,
    retryNote,
  });
  const content = await callOpenRouter({
    apiKey: opts.apiKey, model: opts.model, messages, responseFormat: "json_object",
  });
  const parsed = extractJson(content);
  try {
    return GeneratedProjectSchema.parse(parsed);
  } catch (schemaErr) {
    if (opts.currentProject) {
      const { mergeWithPreservedPage } = await import("@/lib/pipeline/iterate");
      const salvaged = mergeWithPreservedPage(parsed as { pageName: string; files: GeneratedProject["files"] }, opts.currentProject);
      return GeneratedProjectSchema.parse(salvaged);
    }
    throw schemaErr;
  }
}

export async function runCodegen(opts: RunCodegenOptions): Promise<GeneratedProject> {
  try {
    return await attempt(opts);
  } catch (firstErr) {
    try {
      return await attempt(opts, `Your previous response failed validation: ${(firstErr as Error).message}. Return valid JSON matching the schema.`);
    } catch (secondErr) {
      throw new CodegenError(`codegen failed after retry: ${(secondErr as Error).message}`, secondErr);
    }
  }
}
