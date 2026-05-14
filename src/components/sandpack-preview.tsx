"use client";
import {
  SandpackProvider,
  SandpackLayout,
  SandpackPreview as SandpackPreviewPane,
} from "@codesandbox/sandpack-react";
import type { GeneratedProject } from "@/lib/schemas";
import { projectToSandpackFiles } from "@/lib/sandpack-files";

interface Props { project: GeneratedProject | null }

export function SandpackPreview({ project }: Props) {
  if (!project) {
    return (
      <div className="h-full flex items-center justify-center bg-white border-2 border-bauhaus-black p-6">
        <div className="max-w-md">
          <p className="bauhaus-label opacity-60 mb-4">No preview yet</p>
          <ol className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="shrink-0 w-7 h-7 border-2 border-bauhaus-black bg-bauhaus-red text-white font-black flex items-center justify-center text-sm">1</span>
              <span className="font-medium pt-1">Paste your OpenRouter key (top-right)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="shrink-0 w-7 h-7 border-2 border-bauhaus-black bg-bauhaus-blue text-white font-black flex items-center justify-center text-sm">2</span>
              <span className="font-medium pt-1">Draw, pick a sample, or upload a photo</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="shrink-0 w-7 h-7 border-2 border-bauhaus-black bg-bauhaus-yellow text-bauhaus-black font-black flex items-center justify-center text-sm">3</span>
              <span className="font-medium pt-1">Click Generate. Refine with chat.</span>
            </li>
          </ol>
        </div>
      </div>
    );
  }
  return (
    <SandpackProvider
      template="react-ts"
      files={projectToSandpackFiles(project)}
      customSetup={{
        dependencies: { "react": "^18.2.0", "react-dom": "^18.2.0", "lucide-react": "^0.454.0" },
      }}
      options={{ classes: { "sp-wrapper": "!border-2 !border-bauhaus-black !rounded-none !h-full" } }}
    >
      <SandpackLayout style={{ height: "100%" }}>
        <SandpackPreviewPane
          showNavigator={false}
          showRefreshButton
          showOpenInCodeSandbox={false}
          showSandpackErrorOverlay
          style={{ height: "100%", minHeight: "100%", flex: 1 }}
        />
      </SandpackLayout>
    </SandpackProvider>
  );
}
