"use client";
import { useState } from "react";
import { InputPanel, type InputMode } from "@/components/input-panel";
import { ResultPanel } from "@/components/result-panel";
import { ChatPanel } from "@/components/chat-panel";
import { useProject } from "@/contexts/project-context";

interface Props { onOpenKeyDialog: () => void }

export function MainLayout({ onOpenKeyDialog }: Props) {
  const { project, canvasDirty } = useProject();
  const [mode, setMode] = useState<InputMode>("canvas");
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);

  return (
    <main className="h-[calc(100vh-80px)] grid grid-cols-[minmax(340px,1fr)_minmax(480px,1.4fr)] gap-4 p-4 bg-background">
      <InputPanel mode={mode} onModeChange={setMode} onPhoto={setPhotoDataUrl} showDirtyBadge={!!project && canvasDirty} />
      <div className="grid grid-rows-[1fr_280px] gap-4 min-h-0">
        <ResultPanel project={project} />
        <ChatPanel mode={mode} photoDataUrl={photoDataUrl} onOpenKeyDialog={onOpenKeyDialog} onGenerated={() => {}} />
      </div>
    </main>
  );
}
