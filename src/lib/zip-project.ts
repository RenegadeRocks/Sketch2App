import JSZip from "jszip";
import type { GeneratedProject } from "@/lib/schemas";

export async function buildZipBlob(project: GeneratedProject): Promise<Blob> {
  const zip = new JSZip();
  for (const f of project.files) zip.file(f.path, f.contents);
  return zip.generateAsync({ type: "blob" });
}
