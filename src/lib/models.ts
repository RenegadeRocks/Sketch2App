export interface ModelOption {
  id: string;
  label: string;
  supportsVision: boolean;
}

export const MODELS: ModelOption[] = [
  { id: "anthropic/claude-sonnet-4.6", label: "Claude Sonnet 4.6", supportsVision: true },
  { id: "anthropic/claude-opus-4.6", label: "Claude Opus 4.6", supportsVision: true },
  { id: "openai/gpt-4o", label: "GPT-4o", supportsVision: true },
  { id: "google/gemini-2.0-flash-001", label: "Gemini 2.0 Flash", supportsVision: true },
  { id: "anthropic/claude-haiku-4.5", label: "Claude Haiku 4.5", supportsVision: false },
];

export const DEFAULT_MODEL_ID = "anthropic/claude-sonnet-4.6";

export function findModel(id: string): ModelOption | undefined {
  return MODELS.find((m) => m.id === id);
}
