"use client";
import { useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useApiKey } from "@/contexts/api-key-context";
import { useModel } from "@/contexts/model-context";
import { useProject } from "@/contexts/project-context";
import { runCodegen } from "@/lib/pipeline/codegen";
import { runIteration } from "@/lib/pipeline/iterate";
import { normalizePhotoToShapes } from "@/lib/pipeline/vision";
import type { InputMode } from "@/components/input-panel";

interface Props {
  mode: InputMode;
  photoDataUrl: string | null;
  onOpenKeyDialog: () => void;
  onGenerated: () => void;
}

export function ChatPanel({ mode, photoDataUrl, onOpenKeyDialog, onGenerated }: Props) {
  const { apiKey } = useApiKey();
  const { model } = useModel();
  const { project, setProject, canvasShapes, chatHistory, appendChatMessage, markCanvasClean } = useProject();
  const [instruction, setInstruction] = useState("");
  const [busy, setBusy] = useState(false);

  const canGenerate = !busy && !!apiKey && (
    (mode === "canvas" && canvasShapes.length > 0) ||
    (mode === "photo" && !!photoDataUrl && model.supportsVision)
  );

  const runGenerate = async () => {
    if (!apiKey) { onOpenKeyDialog(); return; }
    setBusy(true);
    try {
      let shapes = canvasShapes;
      if (mode === "photo" && photoDataUrl) {
        shapes = await normalizePhotoToShapes({ imageDataUrl: photoDataUrl, apiKey, model: model.id });
      }
      const result = await runCodegen({ shapes, apiKey, model: model.id });
      setProject(result);
      markCanvasClean();
      onGenerated();
      toast.success("Generated!");
    } catch (e: any) {
      if (e?.status === 401) { toast.error("OpenRouter rejected your key."); onOpenKeyDialog(); }
      else if (e?.status === 402) { toast.error("Out of OpenRouter credits — top up at openrouter.ai/credits"); }
      else if (e?.status === 429) { toast.error("Rate limited — wait a moment."); }
      else { toast.error(e?.message ?? "Generation failed"); }
    } finally { setBusy(false); }
  };

  const runIterate = async () => {
    if (!apiKey) { onOpenKeyDialog(); return; }
    if (!project) return;
    if (!instruction.trim()) return;
    setBusy(true);
    appendChatMessage({ role: "user", content: instruction });
    try {
      const result = await runIteration({
        instruction, currentProject: project, canvasShapes,
        apiKey, model: model.id,
      });
      setProject(result);
      appendChatMessage({ role: "assistant", content: `Updated ${result.pageName}.` });
      setInstruction("");
    } catch (e: any) {
      toast.error(e?.message ?? "Iteration failed");
    } finally { setBusy(false); }
  };

  return (
    <div className="h-full flex flex-col border-4 border-bauhaus-black bg-white">
      <div className="border-b-4 border-bauhaus-black p-3 flex items-center justify-between">
        <span className="bauhaus-label">Refine</span>
        <Button onClick={runGenerate} disabled={!canGenerate} size="sm">
          <Sparkles className="w-4 h-4 mr-2" strokeWidth={3} />
          {project ? "Regenerate" : "Generate"}
        </Button>
      </div>
      <div className="flex-1 overflow-auto p-3 space-y-2 text-sm">
        {chatHistory.map((m, i) => (
          <div key={i} className={`border-2 border-bauhaus-black p-2 max-w-[90%] ${m.role === "user" ? "bg-bauhaus-blue/10 ml-auto" : "bg-muted"}`}>
            <span className="bauhaus-label block mb-1">{m.role}</span>
            <span className="font-medium">{m.content}</span>
          </div>
        ))}
        {chatHistory.length === 0 && project && (
          <p className="text-xs opacity-60 font-medium">Type a refinement below ("make the header red") and press Cmd+Enter.</p>
        )}
      </div>
      <div className="border-t-4 border-bauhaus-black p-3 flex gap-2">
        <Textarea
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); runIterate(); }
          }}
          placeholder={project ? "Describe a change…" : "Generate first to start refining"}
          disabled={!project || busy}
          className="border-2 border-bauhaus-black rounded-none resize-none h-16"
        />
        <Button variant="secondary" size="icon" disabled={!project || !instruction.trim() || busy} onClick={runIterate}>
          <Send className="w-4 h-4" strokeWidth={3} />
        </Button>
      </div>
    </div>
  );
}
