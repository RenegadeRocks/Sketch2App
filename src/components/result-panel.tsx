"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SandpackPreview } from "@/components/sandpack-preview";
import { CodeView } from "@/components/code-view";
import { DownloadZipButton } from "@/components/download-zip-button";
import type { GeneratedProject } from "@/lib/schemas";

interface Props { project: GeneratedProject | null }

export function ResultPanel({ project }: Props) {
  return (
    <div className="h-full flex flex-col border-4 border-bauhaus-black bg-white">
      <div className="border-b-4 border-bauhaus-black p-3 flex items-center justify-between">
        <span className="bauhaus-label">Result</span>
        {project && <DownloadZipButton project={project} />}
      </div>
      <Tabs defaultValue="preview" className="flex-1 flex flex-col">
        <TabsList className="rounded-none border-b-4 border-bauhaus-black bg-muted p-0 h-auto">
          <TabsTrigger value="preview" className="rounded-none border-r-2 border-bauhaus-black font-bold uppercase tracking-wider data-active:bg-bauhaus-red data-active:text-white">
            Preview
          </TabsTrigger>
          <TabsTrigger value="code" className="rounded-none font-bold uppercase tracking-wider data-active:bg-bauhaus-red data-active:text-white">
            Code
          </TabsTrigger>
        </TabsList>
        <TabsContent value="preview" className="flex-1 m-0">
          <SandpackPreview project={project} />
        </TabsContent>
        <TabsContent value="code" className="flex-1 m-0 overflow-hidden">
          {project ? <CodeView project={project} /> : (
            <div className="h-full flex items-center justify-center"><p className="bauhaus-label opacity-60">No code yet</p></div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
