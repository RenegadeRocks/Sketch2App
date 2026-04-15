// Preview-only shims for shadcn/ui primitives used by the codegen prompt.
// These keep the Sandpack preview working without shipping real shadcn deps.
// The downloaded ZIP is unchanged — shims are injected only into the sandbox.

type SandpackFiles = Record<string, { code: string }>;

const button = `
import * as React from "react";
export const Button = React.forwardRef(function Button(
  { className = "", variant, size, asChild, ...props }: any,
  ref: any
) {
  const base = "inline-flex items-center justify-center rounded-md text-sm font-medium px-4 py-2 border bg-white hover:bg-neutral-50 disabled:opacity-50 disabled:pointer-events-none";
  return <button ref={ref} className={base + " " + className} {...props} />;
});
export default Button;
`.trim();

const input = `
import * as React from "react";
export const Input = React.forwardRef(function Input(
  { className = "", ...props }: any,
  ref: any
) {
  return <input ref={ref} className={"block w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-300 " + className} {...props} />;
});
export default Input;
`.trim();

const textarea = `
import * as React from "react";
export const Textarea = React.forwardRef(function Textarea(
  { className = "", ...props }: any,
  ref: any
) {
  return <textarea ref={ref} className={"block w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-300 " + className} {...props} />;
});
export default Textarea;
`.trim();

const label = `
import * as React from "react";
export const Label = React.forwardRef(function Label(
  { className = "", ...props }: any,
  ref: any
) {
  return <label ref={ref} className={"text-sm font-medium " + className} {...props} />;
});
export default Label;
`.trim();

const badge = `
import * as React from "react";
export function Badge({ className = "", ...props }: any) {
  return <span className={"inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium " + className} {...props} />;
}
export default Badge;
`.trim();

const separator = `
import * as React from "react";
export function Separator({ className = "", orientation = "horizontal", ...props }: any) {
  const base = orientation === "vertical" ? "w-px h-full bg-neutral-200" : "h-px w-full bg-neutral-200";
  return <div role="separator" className={base + " " + className} {...props} />;
}
export default Separator;
`.trim();

const card = `
import * as React from "react";
const make = (base: string) => React.forwardRef(function C({ className = "", ...props }: any, ref: any) {
  return <div ref={ref} className={base + " " + className} {...props} />;
});
export const Card = make("rounded-lg border bg-white shadow-sm");
export const CardHeader = make("flex flex-col space-y-1.5 p-6");
export const CardTitle = make("text-lg font-semibold leading-none tracking-tight");
export const CardDescription = make("text-sm text-neutral-500");
export const CardContent = make("p-6 pt-0");
export const CardFooter = make("flex items-center p-6 pt-0");
`.trim();

const dialog = `
import * as React from "react";
export function Dialog({ children }: any) { return <div>{children}</div>; }
export function DialogTrigger({ children, asChild, ...props }: any) {
  return <span {...props}>{children}</span>;
}
export function DialogContent({ className = "", children, ...props }: any) {
  return <div className={"rounded-lg border bg-white p-6 shadow " + className} {...props}>{children}</div>;
}
export function DialogHeader({ className = "", ...props }: any) {
  return <div className={"flex flex-col space-y-1.5 " + className} {...props} />;
}
export function DialogTitle({ className = "", ...props }: any) {
  return <h2 className={"text-lg font-semibold " + className} {...props} />;
}
export function DialogDescription({ className = "", ...props }: any) {
  return <p className={"text-sm text-neutral-500 " + className} {...props} />;
}
export function DialogFooter({ className = "", ...props }: any) {
  return <div className={"flex justify-end gap-2 pt-4 " + className} {...props} />;
}
`.trim();

const tabs = `
import * as React from "react";
const Ctx = React.createContext<{ value: string; setValue: (v: string) => void } | null>(null);
export function Tabs({ defaultValue = "", value, onValueChange, children, className = "", ...props }: any) {
  const [internal, setInternal] = React.useState(value ?? defaultValue);
  const current = value ?? internal;
  const setValue = (v: string) => { setInternal(v); onValueChange?.(v); };
  return <Ctx.Provider value={{ value: current, setValue }}><div className={className} {...props}>{children}</div></Ctx.Provider>;
}
export function TabsList({ className = "", ...props }: any) {
  return <div className={"inline-flex items-center justify-center rounded-md bg-neutral-100 p-1 " + className} {...props} />;
}
export function TabsTrigger({ value, className = "", children, ...props }: any) {
  const ctx = React.useContext(Ctx);
  const active = ctx?.value === value;
  return (
    <button
      type="button"
      onClick={() => ctx?.setValue(value)}
      className={"px-3 py-1.5 text-sm font-medium rounded " + (active ? "bg-white shadow " : "") + className}
      {...props}
    >{children}</button>
  );
}
export function TabsContent({ value, className = "", children, ...props }: any) {
  const ctx = React.useContext(Ctx);
  if (ctx?.value !== value) return null;
  return <div className={"mt-2 " + className} {...props}>{children}</div>;
}
`.trim();

const tooltip = `
import * as React from "react";
export function TooltipProvider({ children }: any) { return <>{children}</>; }
export function Tooltip({ children }: any) { return <span className="relative inline-block group">{children}</span>; }
export function TooltipTrigger({ children, asChild, ...props }: any) {
  return <span {...props}>{children}</span>;
}
export function TooltipContent({ className = "", children, ...props }: any) {
  return (
    <span
      className={"pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block rounded bg-neutral-900 px-2 py-1 text-xs text-white " + className}
      {...props}
    >{children}</span>
  );
}
`.trim();

const accordion = `
import * as React from "react";
const ItemCtx = React.createContext<{ open: boolean; toggle: () => void } | null>(null);
export function Accordion({ children, className = "", ...props }: any) {
  return <div className={className} {...props}>{children}</div>;
}
export function AccordionItem({ children, className = "", ...props }: any) {
  const [open, setOpen] = React.useState(false);
  return (
    <ItemCtx.Provider value={{ open, toggle: () => setOpen(o => !o) }}>
      <div className={"border-b " + className} {...props}>{children}</div>
    </ItemCtx.Provider>
  );
}
export function AccordionTrigger({ children, className = "", ...props }: any) {
  const ctx = React.useContext(ItemCtx);
  return (
    <button
      type="button"
      onClick={() => ctx?.toggle()}
      className={"flex w-full items-center justify-between py-3 text-sm font-medium " + className}
      {...props}
    >{children}<span className="ml-2">{ctx?.open ? "−" : "+"}</span></button>
  );
}
export function AccordionContent({ children, className = "", ...props }: any) {
  const ctx = React.useContext(ItemCtx);
  if (!ctx?.open) return null;
  return <div className={"pb-3 text-sm " + className} {...props}>{children}</div>;
}
`.trim();

const select = `
import * as React from "react";
const Ctx = React.createContext<{ value: string; setValue: (v: string) => void } | null>(null);
export function Select({ value, defaultValue = "", onValueChange, children }: any) {
  const [internal, setInternal] = React.useState(value ?? defaultValue);
  const current = value ?? internal;
  const setValue = (v: string) => { setInternal(v); onValueChange?.(v); };
  return <Ctx.Provider value={{ value: current, setValue }}>{children}</Ctx.Provider>;
}
export function SelectTrigger({ className = "", children, ...props }: any) {
  return <div className={"inline-flex items-center justify-between rounded-md border px-3 py-2 text-sm " + className} {...props}>{children}</div>;
}
export function SelectValue({ placeholder }: any) {
  const ctx = React.useContext(Ctx);
  return <span className="text-sm">{ctx?.value || placeholder || ""}</span>;
}
export function SelectContent({ className = "", children, ...props }: any) {
  return <div className={"mt-1 rounded-md border bg-white shadow " + className} {...props}>{children}</div>;
}
export function SelectItem({ value, className = "", children, ...props }: any) {
  const ctx = React.useContext(Ctx);
  const active = ctx?.value === value;
  return (
    <div
      role="option"
      onClick={() => ctx?.setValue(value)}
      className={"cursor-pointer px-3 py-2 text-sm hover:bg-neutral-100 " + (active ? "bg-neutral-100 " : "") + className}
      {...props}
    >{children}</div>
  );
}
`.trim();

export function shadcnShimFiles(): SandpackFiles {
  return {
    "/components/ui/button.tsx": { code: button },
    "/components/ui/input.tsx": { code: input },
    "/components/ui/textarea.tsx": { code: textarea },
    "/components/ui/label.tsx": { code: label },
    "/components/ui/badge.tsx": { code: badge },
    "/components/ui/separator.tsx": { code: separator },
    "/components/ui/card.tsx": { code: card },
    "/components/ui/dialog.tsx": { code: dialog },
    "/components/ui/tabs.tsx": { code: tabs },
    "/components/ui/tooltip.tsx": { code: tooltip },
    "/components/ui/accordion.tsx": { code: accordion },
    "/components/ui/select.tsx": { code: select },
  };
}
