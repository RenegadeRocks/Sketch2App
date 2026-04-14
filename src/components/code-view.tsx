"use client";
import { useState } from "react";
import { ShikiHighlighter } from "react-shiki";
import type { GeneratedProject } from "@/lib/schemas";

interface Props { project: GeneratedProject }

export function CodeView({ project }: Props) {
  const [selected, setSelected] = useState(project.files[0].path);
  const current = project.files.find((f) => f.path === selected) ?? project.files[0];

  return (
    <div className="h-full grid grid-cols-[220px_1fr]">
      <aside className="border-r-2 border-bauhaus-black bg-white overflow-auto">
        <ul>
          {project.files.map((f) => (
            <li key={f.path}>
              <button
                onClick={() => setSelected(f.path)}
                className={`w-full text-left px-3 py-2 font-mono text-xs border-b border-bauhaus-black/30 hover:bg-muted ${
                  selected === f.path ? "bg-bauhaus-yellow font-bold" : ""
                }`}
              >
                {f.path}
              </button>
            </li>
          ))}
        </ul>
      </aside>
      <div className="overflow-auto bg-white">
        <ShikiHighlighter language="tsx" theme="github-light">
          {current.contents}
        </ShikiHighlighter>
      </div>
    </div>
  );
}
