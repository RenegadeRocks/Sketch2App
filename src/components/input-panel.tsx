"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TldrawCanvas } from "@/components/tldraw-canvas";
import { PhotoDropzone } from "@/components/photo-dropzone";
import { SampleSketches } from "@/components/sample-sketches";

export type InputMode = "canvas" | "photo";

interface Props {
  mode: InputMode;
  onModeChange: (m: InputMode) => void;
  onPhoto: (dataUrl: string | null) => void;
  showDirtyBadge: boolean;
}

export function InputPanel({ mode, onModeChange, onPhoto, showDirtyBadge }: Props) {
  return (
    <div className="h-full flex flex-col border-4 border-bauhaus-black bg-white">
      <div className="border-b-4 border-bauhaus-black p-3 flex items-center justify-between">
        <span className="bauhaus-label">{mode === "canvas" ? "Sketch" : "Photo"}</span>
        {showDirtyBadge && mode === "canvas" && (
          <span className="text-xs font-bold uppercase bg-bauhaus-yellow px-2 py-1 border-2 border-bauhaus-black">
            Canvas changed — regenerate
          </span>
        )}
      </div>
      <Tabs value={mode} onValueChange={(v) => onModeChange(v as InputMode)} className="flex-1 flex flex-col">
        <TabsList className="rounded-none border-b-4 border-bauhaus-black bg-muted p-0 h-auto">
          <TabsTrigger value="canvas" className="rounded-none border-r-2 border-bauhaus-black font-bold uppercase tracking-wider data-active:bg-bauhaus-blue data-active:text-white">
            Canvas
          </TabsTrigger>
          <TabsTrigger value="photo" className="rounded-none font-bold uppercase tracking-wider data-active:bg-bauhaus-blue data-active:text-white">
            Upload Photo
          </TabsTrigger>
        </TabsList>
        <TabsContent value="canvas" className="flex-1 m-0 flex flex-col">
          <SampleSketches />
          <div className="flex-1 min-h-0">
            <TldrawCanvas />
          </div>
        </TabsContent>
        <TabsContent value="photo" className="flex-1 m-0">
          <PhotoDropzone onPhoto={(url) => onPhoto(url)} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
