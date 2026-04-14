"use client";
import { Sandpack } from "@codesandbox/sandpack-react";
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
    <Sandpack
      template="react-ts"
      files={projectToSandpackFiles(project)}
      options={{
        showTabs: false, showLineNumbers: false, showNavigator: false,
        editorHeight: "100%", classes: { "sp-wrapper": "!border-2 !border-bauhaus-black !rounded-none" },
      }}
      customSetup={{
        dependencies: { "react": "^18.2.0", "react-dom": "^18.2.0", "lucide-react": "^0.454.0" },
      }}
    />
  );
}
