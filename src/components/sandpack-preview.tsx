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
      <div className="h-full flex items-center justify-center bg-white border-2 border-bauhaus-black">
        <p className="bauhaus-label opacity-60">No preview yet — generate to see it here</p>
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
