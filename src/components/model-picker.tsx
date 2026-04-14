"use client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useModel } from "@/contexts/model-context";

export function ModelPicker() {
  const { model, setModelById, models } = useModel();
  return (
    <Select value={model.id} onValueChange={(id) => id && setModelById(id)}>
      <SelectTrigger className="w-[220px] border-2 border-bauhaus-black rounded-none font-bold uppercase text-xs tracking-wider bg-white">
        <SelectValue>{model.label}</SelectValue>
      </SelectTrigger>
      <SelectContent className="border-2 border-bauhaus-black rounded-none">
        {models.map((m) => (
          <SelectItem key={m.id} value={m.id} className="font-bold">
            {m.label}{!m.supportsVision ? " (text only)" : ""}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
