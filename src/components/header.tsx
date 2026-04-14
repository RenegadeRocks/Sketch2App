"use client";
import { KeyRound } from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { ModelPicker } from "@/components/model-picker";
import { useApiKey } from "@/contexts/api-key-context";

interface Props { onOpenKeyDialog: () => void }

export function Header({ onOpenKeyDialog }: Props) {
  const { apiKey } = useApiKey();
  return (
    <header className="h-20 border-b-4 border-bauhaus-black bg-white flex items-center justify-between px-6">
      <Logo size={28} />
      <div className="flex items-center gap-3">
        <ModelPicker />
        <Button variant={apiKey ? "outline" : "default"} size="sm" onClick={onOpenKeyDialog}>
          <KeyRound className="w-4 h-4 mr-2" strokeWidth={3} />
          {apiKey ? "Key Set" : "Set Key"}
        </Button>
      </div>
    </header>
  );
}
