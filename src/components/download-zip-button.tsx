"use client";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildZipBlob } from "@/lib/zip-project";
import type { GeneratedProject } from "@/lib/schemas";

interface Props { project: GeneratedProject }

export function DownloadZipButton({ project }: Props) {
  const onClick = async () => {
    const blob = await buildZipBlob(project);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project.pageName}.zip`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  };
  return (
    <Button variant="accent" onClick={onClick} size="sm">
      <Download className="w-4 h-4 mr-2" strokeWidth={3} />
      Zip
    </Button>
  );
}
