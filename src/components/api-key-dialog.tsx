"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApiKey } from "@/contexts/api-key-context";

interface Props { open: boolean; onOpenChange: (open: boolean) => void }

export function ApiKeyDialog({ open, onOpenChange }: Props) {
  const { setApiKey } = useApiKey();
  const [value, setValue] = useState("");

  const save = () => {
    if (!value.trim()) return;
    setApiKey(value.trim());
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-4 border-bauhaus-black shadow-bauhaus-lg bg-white rounded-none">
        <DialogHeader>
          <DialogTitle className="uppercase font-black tracking-tighter">API Key Setup</DialogTitle>
          <DialogDescription className="font-medium">
            Paste your OpenRouter key. Stored only in your browser's localStorage.{" "}
            <a className="underline font-bold" href="https://openrouter.ai/keys" target="_blank" rel="noreferrer">
              Get one →
            </a>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="or-key" className="bauhaus-label">OpenRouter API Key</Label>
          <Input id="or-key" type="password" placeholder="sk-or-..." value={value}
                 onChange={(e) => setValue(e.target.value)}
                 className="border-2 border-bauhaus-black rounded-none font-mono" />
        </div>
        <DialogFooter>
          <Button onClick={save} disabled={!value.trim()}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
