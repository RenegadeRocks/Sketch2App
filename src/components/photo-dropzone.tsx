"use client";
import { useState } from "react";
import { Upload, AlertTriangle } from "lucide-react";
import { fileToDataUrl } from "@/lib/image-compress";
import { useModel } from "@/contexts/model-context";

interface Props { onPhoto: (dataUrl: string) => void }

export function PhotoDropzone({ onPhoto }: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const { model } = useModel();

  const handleFile = async (file: File) => {
    const url = await fileToDataUrl(file);
    setPreview(url);
    onPhoto(url);
  };

  return (
    <div className="h-full w-full flex flex-col">
      {!model.supportsVision && (
        <div className="bg-bauhaus-yellow border-b-2 border-bauhaus-black px-3 py-2 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" strokeWidth={3} />
          <span className="text-xs font-bold uppercase tracking-wider">
            {model.label} can&apos;t read images. Pick a vision-capable model.
          </span>
        </div>
      )}
      <div className="flex-1 border-2 border-bauhaus-black border-dashed bg-white flex items-center justify-center p-4">
        <input id="photo" type="file" accept="image/*" className="sr-only"
               onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
        <label htmlFor="photo" className="cursor-pointer flex flex-col items-center gap-3 text-center">
          {preview ? (
            <img src={preview} alt="Uploaded sketch" className="max-h-64 border-2 border-bauhaus-black" />
          ) : (
            <>
              <div className="w-16 h-16 border-4 border-bauhaus-black bg-bauhaus-yellow flex items-center justify-center shadow-bauhaus">
                <Upload className="w-8 h-8 text-bauhaus-black" strokeWidth={3} />
              </div>
              <span className="bauhaus-label">Drop photo or click to upload</span>
              <span className="text-xs opacity-70 font-medium">PNG, JPG — under 5 MB</span>
            </>
          )}
        </label>
      </div>
    </div>
  );
}
