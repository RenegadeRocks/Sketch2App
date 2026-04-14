export const ALLOWED_SHADCN = [
  "Button", "Card", "CardHeader", "CardTitle", "CardDescription", "CardContent", "CardFooter",
  "Dialog", "DialogTrigger", "DialogContent", "DialogHeader", "DialogTitle", "DialogDescription", "DialogFooter",
  "Tabs", "TabsList", "TabsTrigger", "TabsContent",
  "Tooltip", "TooltipTrigger", "TooltipContent", "TooltipProvider",
  "Accordion", "AccordionItem", "AccordionTrigger", "AccordionContent",
  "Select", "SelectTrigger", "SelectContent", "SelectItem", "SelectValue",
  "Input", "Textarea", "Label", "Badge", "Separator",
] as const;

export type AllowedShadcn = (typeof ALLOWED_SHADCN)[number];

const allowedSet = new Set<string>(ALLOWED_SHADCN);
export function isAllowedImport(name: string): boolean {
  return allowedSet.has(name);
}
