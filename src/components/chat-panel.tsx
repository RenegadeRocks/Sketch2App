"use client";
import { useState } from "react";
import { Send, Sparkles, Loader2 } from "lucide-react";
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
  const [stage, setStage] = useState<string>("");

  const canGenerate = !busy && !!apiKey && (
    (mode === "canvas" && canvasShapes.length > 0) ||
    (mode === "photo" && !!photoDataUrl && model.supportsVision)
  );

  const runGenerate = async () => {
    if (!apiKey) { onOpenKeyDialog(); return; }
    setBusy(true);
    setStage(mode === "photo" ? "Reading the photo…" : "Reading your sketch…");
    try {
      let shapes = canvasShapes;
      if (mode === "photo" && photoDataUrl) {
        setStage("Identifying shapes in the photo…");
        console.log("[sketch2app] vision step: normalizing photo → shapes");
        shapes = await normalizePhotoToShapes({ imageDataUrl: photoDataUrl, apiKey, model: model.id });
        console.log("[sketch2app] vision returned", shapes.length, "shapes", shapes);
      }
      setStage(`Generating React components from ${shapes.length} shapes…`);
      console.log("[sketch2app] codegen step: generating with", shapes.length, "shapes");
      const result = await runCodegen({ shapes, apiKey, model: model.id });
      console.log("[sketch2app] codegen returned", result);
      setStage("Compiling preview…");
      setProject(result);
      markCanvasClean();
      onGenerated();
      toast.success("Generated!");
    } catch (e: any) {
      console.error("[sketch2app] generation failed", e);
      const msg = e?.message ?? String(e);
      if (e?.status === 401) { toast.error("OpenRouter rejected your key.", { duration: 10000 }); onOpenKeyDialog(); }
      else if (e?.status === 402) { toast.error("Out of OpenRouter credits — top up at openrouter.ai/credits", { duration: 10000 }); }
      else if (e?.status === 429) { toast.error("Rate limited — wait a moment.", { duration: 10000 }); }
      else { toast.error(`Generation failed: ${msg}`, { duration: 20000 }); }
    } finally { setBusy(false); setStage(""); }
  };

  const runIterate = async () => {
    if (!apiKey) { onOpenKeyDialog(); return; }
    if (!project) return;
    if (!instruction.trim()) return;
    setBusy(true);
    setStage("Applying your refinement…");
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
    } finally { setBusy(false); setStage(""); }
  };

  return (
    <div className="h-full flex flex-col border-4 border-bauhaus-black bg-white">
      <div className="border-b-4 border-bauhaus-black p-3 flex items-center justify-between">
        <span className="bauhaus-label">Refine</span>
        <Button onClick={runGenerate} disabled={!canGenerate} size="sm">
          {busy ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" strokeWidth={3} />
          ) : (
            <Sparkles className="w-4 h-4 mr-2" strokeWidth={3} />
          )}
          {busy ? "Generating…" : project ? "Regenerate" : "Generate"}
        </Button>
      </div>
      {busy && (
        <div className="border-b-2 border-bauhaus-black bg-bauhaus-yellow px-3 py-2 flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" strokeWidth={3} />
          <span className="bauhaus-label">{stage || "Working…"}</span>
        </div>
      )}
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
