# Sketch2App MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a demo-grade Sketch2App MVP — users draw a wireframe (tldraw or photo), pick an OpenRouter model, and receive a decomposed Next.js page (shadcn/ui + Tailwind + TS) with live preview and chat-based iterative refinement.

**Architecture:** Next.js 15 App Router on Vercel. Entirely client-side except a thin `/api/openrouter` proxy. BYOK (user pastes OpenRouter key, stored in `localStorage`). tldraw canvas + photo upload both produce a unified `CanvasShape[]` internal representation; a code-gen LLM call converts that to a `GeneratedProject` (page + sub-components). Sandpack renders the generated code in a sandboxed iframe. Iteration is full-regeneration, not diff patches. Bauhaus-themed wrapper UI; generated output stays neutral shadcn.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn/ui, `@tldraw/tldraw`, `@codesandbox/sandpack-react`, zod, `jszip`, `shiki`, `lucide-react`, `eventsource-parser`, vitest, `@testing-library/react`, playwright.

**Spec:** `docs/superpowers/specs/2026-04-14-sketch2app-design.md`

---

## Conventions

- All commands run from the project root: `D:\Work\ClaudeCode\Sketch2App`.
- Package manager: **pnpm** (fast, disk-efficient, stable workspaces if we ever split). Fall back to `npm` if pnpm isn't available.
- Path alias: `@/*` → `./src/*` (Next.js default with `--src-dir`).
- Tests live in `tests/` at project root, mirroring `src/` structure. Vitest resolves both.
- Commit after every passing task. Conventional Commits format (`feat:`, `test:`, `chore:`, `fix:`).
- Every TDD task follows: **write failing test → verify fails → minimal impl → verify passes → commit**.

---

## Phase 0 — Project Scaffolding (Tasks 1–8)

### Task 1: Bootstrap Next.js project, initialize git

**Files:**
- Create: entire project skeleton under `D:\Work\ClaudeCode\Sketch2App\`
- Preserves: existing `CLAUDE.md`, `MEMORY.md`, `docs/` at project root

- [ ] **Step 1: Temporarily move existing files aside**

```bash
cd D:/Work/ClaudeCode/Sketch2App
mkdir -p .tmp-existing
mv CLAUDE.md MEMORY.md docs .tmp-existing/
```

- [ ] **Step 2: Scaffold Next.js into the current directory**

Run (answer prompts with TypeScript=Yes, ESLint=Yes, Tailwind=Yes, src/=Yes, App Router=Yes, import alias=Yes `@/*`):

```bash
pnpm create next-app@latest . --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --no-turbopack
```

Expected: `src/app/page.tsx`, `src/app/layout.tsx`, `src/app/globals.css`, `tailwind.config.ts`, `tsconfig.json`, `package.json`, `next.config.mjs` exist.

- [ ] **Step 3: Restore preserved files**

```bash
mv .tmp-existing/CLAUDE.md .
mv .tmp-existing/MEMORY.md .
mv .tmp-existing/docs .
rmdir .tmp-existing
```

- [ ] **Step 4: Initialize git and make initial commit**

```bash
git init
git add -A
git commit -m "chore: bootstrap Next.js app with existing CLAUDE.md, MEMORY.md, docs/"
```

- [ ] **Step 5: Add `.superpowers/` and OS cruft to `.gitignore`**

Append to `.gitignore`:

```
.superpowers/
.DS_Store
Thumbs.db
```

- [ ] **Step 6: Verify dev server starts**

```bash
pnpm dev
```

Expected: "Ready on http://localhost:3000" — open it, see default Next.js page, Ctrl+C.

- [ ] **Step 7: Commit**

```bash
git add .gitignore
git commit -m "chore: add .superpowers and OS cruft to gitignore"
```

---

### Task 2: Install core runtime dependencies

**Files:**
- Modify: `package.json`, `pnpm-lock.yaml`

- [ ] **Step 1: Install runtime deps**

```bash
pnpm add @tldraw/tldraw @codesandbox/sandpack-react zod jszip shiki react-shiki lucide-react eventsource-parser sonner
```

- [ ] **Step 2: Install dev deps for testing**

```bash
pnpm add -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @playwright/test
```

- [ ] **Step 3: Install Playwright browsers**

```bash
pnpm exec playwright install --with-deps chromium
```

- [ ] **Step 4: Verify install**

```bash
pnpm typecheck || pnpm tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: install runtime and test dependencies"
```

---

### Task 3: Initialize shadcn/ui and install primitive components

**Files:**
- Create: `components.json`, `src/components/ui/*`, `src/lib/utils.ts`

- [ ] **Step 1: Init shadcn/ui**

```bash
pnpm dlx shadcn@latest init
```

Answer prompts: Style=**New York**, Base Color=**Neutral**, CSS variables=**Yes**.

- [ ] **Step 2: Add required primitives**

```bash
pnpm dlx shadcn@latest add button dialog tabs tooltip accordion select card sonner textarea input label separator badge
```

Expected: files in `src/components/ui/` for each primitive.

- [ ] **Step 3: Verify TypeScript compiles**

```bash
pnpm tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add components.json src/components/ui src/lib/utils.ts src/app/globals.css tailwind.config.ts package.json pnpm-lock.yaml
git commit -m "feat: init shadcn/ui with required primitives"
```

---

### Task 4: Load Outfit font via next/font

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Replace font setup in `src/app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Sketch2App",
  description: "Hand-drawn or digital wireframes into production React code.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={outfit.variable}>
      <body className="font-sans antialiased bg-[#F0F0F0] text-[#121212]">
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Wire the font variable into Tailwind**

In `tailwind.config.ts`, extend `theme.extend.fontFamily`:

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-outfit)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
```

(Keep any shadcn-added sections if present; only add the `fontFamily` extension.)

- [ ] **Step 3: Start dev server and visually verify Outfit loads**

```bash
pnpm dev
```

Open `http://localhost:3000`, inspect computed font-family on `<body>` — expect `Outfit` at the start. Ctrl+C.

- [ ] **Step 4: Commit**

```bash
git add src/app/layout.tsx tailwind.config.ts
git commit -m "feat: load Outfit font via next/font"
```

---

### Task 5: Define Bauhaus theme tokens

**Files:**
- Modify: `src/app/globals.css`, `tailwind.config.ts`

- [ ] **Step 1: Replace `globals.css` contents**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 94%;          /* #F0F0F0 */
    --foreground: 0 0% 7%;           /* #121212 */
    --card: 0 0% 100%;
    --card-foreground: 0 0% 7%;
    --popover: 0 0% 100%;
    --popover-foreground: 0 0% 7%;
    --primary: 0 74% 47%;            /* #D02020 */
    --primary-foreground: 0 0% 100%;
    --secondary: 222 85% 41%;        /* #1040C0 */
    --secondary-foreground: 0 0% 100%;
    --accent: 44 87% 53%;            /* #F0C020 */
    --accent-foreground: 0 0% 7%;
    --muted: 0 0% 88%;               /* #E0E0E0 */
    --muted-foreground: 0 0% 25%;
    --border: 0 0% 7%;
    --input: 0 0% 7%;
    --ring: 0 74% 47%;
    --radius: 0px;
  }
}

@layer base {
  * { @apply border-border; }
  body { @apply bg-background text-foreground; }
  h1, h2, h3 { @apply font-black uppercase tracking-tighter leading-[0.9]; }
  .bauhaus-label { @apply uppercase font-bold tracking-widest text-xs; }
}
```

- [ ] **Step 2: Extend Tailwind config with Bauhaus utilities**

Replace `tailwind.config.ts` with:

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-outfit)", "system-ui", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        bauhaus: {
          red: "#D02020",
          blue: "#1040C0",
          yellow: "#F0C020",
          black: "#121212",
        },
      },
      boxShadow: {
        bauhaus: "4px 4px 0px 0px #121212",
        "bauhaus-md": "6px 6px 0px 0px #121212",
        "bauhaus-lg": "8px 8px 0px 0px #121212",
      },
      borderRadius: {
        lg: "0px",
        md: "0px",
        sm: "0px",
      },
    },
  },
  plugins: [],
};
export default config;
```

- [ ] **Step 3: Verify build still compiles**

```bash
pnpm tsc --noEmit
pnpm dev
```

Open `http://localhost:3000`: background should now be `#F0F0F0`. Ctrl+C.

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css tailwind.config.ts
git commit -m "feat: define Bauhaus theme tokens and utilities"
```

---

### Task 6: Override shadcn Button with Bauhaus variants

**Files:**
- Modify: `src/components/ui/button.tsx`
- Test: `tests/unit/button.test.tsx`

- [ ] **Step 1: Create vitest config** (required for this test to run)

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
```

Install the Vite React plugin:

```bash
pnpm add -D @vitejs/plugin-react
```

Create `tests/setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

Add scripts to `package.json` (`scripts` section):

```json
"test": "vitest",
"test:run": "vitest run",
"test:ui": "vitest --ui",
"e2e": "playwright test"
```

- [ ] **Step 2: Write failing test**

Create `tests/unit/button.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Button } from "@/components/ui/button";

describe("Button (Bauhaus)", () => {
  it("primary variant has red background and hard shadow", () => {
    render(<Button variant="default">Go</Button>);
    const btn = screen.getByRole("button", { name: /go/i });
    expect(btn.className).toContain("bg-bauhaus-red");
    expect(btn.className).toContain("shadow-bauhaus");
    expect(btn.className).toContain("uppercase");
  });

  it("secondary variant has blue background", () => {
    render(<Button variant="secondary">Go</Button>);
    expect(screen.getByRole("button").className).toContain("bg-bauhaus-blue");
  });

  it("accent variant has yellow background with black text", () => {
    render(<Button variant="accent">Go</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("bg-bauhaus-yellow");
    expect(btn.className).toContain("text-bauhaus-black");
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

```bash
pnpm test:run tests/unit/button.test.tsx
```

Expected: FAIL — `className` lacks `bg-bauhaus-red` etc.

- [ ] **Step 4: Replace `src/components/ui/button.tsx`**

```tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap font-bold uppercase tracking-wider transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bauhaus-black focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none border-2 border-bauhaus-black",
  {
    variants: {
      variant: {
        default: "bg-bauhaus-red text-white shadow-bauhaus hover:bg-bauhaus-red/90",
        secondary: "bg-bauhaus-blue text-white shadow-bauhaus hover:bg-bauhaus-blue/90",
        accent: "bg-bauhaus-yellow text-bauhaus-black shadow-bauhaus hover:bg-bauhaus-yellow/90",
        outline: "bg-white text-bauhaus-black shadow-bauhaus hover:bg-muted",
        ghost: "border-none shadow-none hover:bg-muted",
      },
      size: {
        default: "h-11 px-5 py-2 text-sm",
        sm: "h-9 px-4 text-xs",
        lg: "h-14 px-8 text-base",
        icon: "h-11 w-11",
      },
      shape: {
        square: "rounded-none",
        pill: "rounded-full",
      },
    },
    defaultVariants: { variant: "default", size: "default", shape: "square" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, shape, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, shape, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
```

- [ ] **Step 5: Run test to verify it passes**

```bash
pnpm test:run tests/unit/button.test.tsx
```

Expected: PASS — 3 tests green.

- [ ] **Step 6: Commit**

```bash
git add vitest.config.ts tests/setup.ts tests/unit/button.test.tsx src/components/ui/button.tsx package.json pnpm-lock.yaml
git commit -m "feat: Bauhaus variants for Button + vitest config"
```

---

### Task 7: Add typecheck and lint scripts, confirm CI-ready

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Add scripts**

In `package.json` `scripts`:

```json
"typecheck": "tsc --noEmit",
"lint:strict": "next lint --max-warnings=0"
```

- [ ] **Step 2: Run**

```bash
pnpm typecheck
pnpm lint:strict
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add package.json
git commit -m "chore: add typecheck and strict lint scripts"
```

---

### Task 8: Playwright config + smoke test

**Files:**
- Create: `playwright.config.ts`, `tests/e2e/smoke.spec.ts`

- [ ] **Step 1: Create `playwright.config.ts`**

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
```

- [ ] **Step 2: Write failing smoke test**

Create `tests/e2e/smoke.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test("home page renders with Bauhaus background", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("body")).toHaveCSS("background-color", "rgb(240, 240, 240)");
});
```

- [ ] **Step 3: Run — verify it PASSES** (default Next.js page is fine; body bg is Bauhaus-configured)

```bash
pnpm e2e tests/e2e/smoke.spec.ts
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add playwright.config.ts tests/e2e/smoke.spec.ts
git commit -m "test: add playwright config and smoke test"
```

---

## Phase 1 — Schemas & Validation (Tasks 9–10)

### Task 9: Zod schemas for CanvasShape and GeneratedProject

**Files:**
- Create: `src/lib/schemas.ts`
- Test: `tests/unit/schemas.test.ts`

- [ ] **Step 1: Write failing test**

Create `tests/unit/schemas.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import {
  CanvasShapeSchema,
  GeneratedProjectSchema,
  GeneratedFileSchema,
} from "@/lib/schemas";

describe("CanvasShapeSchema", () => {
  it("accepts a valid geo rectangle", () => {
    const parsed = CanvasShapeSchema.parse({
      type: "geo",
      id: "s1",
      x: 10, y: 20, w: 100, h: 40,
      props: { geo: "rectangle", text: "Login" },
    });
    expect(parsed.type).toBe("geo");
  });

  it("rejects a geo shape missing w/h", () => {
    expect(() =>
      CanvasShapeSchema.parse({ type: "geo", id: "s1", x: 0, y: 0, props: { geo: "rectangle" } })
    ).toThrow();
  });

  it("accepts a text shape", () => {
    const parsed = CanvasShapeSchema.parse({
      type: "text", id: "t1", x: 0, y: 0,
      props: { text: "Hi", size: "m" },
    });
    expect(parsed.type).toBe("text");
  });

  it("rejects unknown shape type", () => {
    expect(() =>
      CanvasShapeSchema.parse({ type: "bogus", id: "x", x: 0, y: 0, props: {} })
    ).toThrow();
  });
});

describe("GeneratedProjectSchema", () => {
  it("accepts a valid project with exactly one page file", () => {
    const parsed = GeneratedProjectSchema.parse({
      pageName: "LoginPage",
      files: [
        { path: "app/page.tsx", contents: "export default function Page(){return null}", role: "page" },
        { path: "components/Form.tsx", contents: "export function Form(){return null}", role: "component" },
      ],
    });
    expect(parsed.files).toHaveLength(2);
  });

  it("rejects project with no page file", () => {
    expect(() =>
      GeneratedProjectSchema.parse({
        pageName: "X",
        files: [{ path: "components/X.tsx", contents: "x", role: "component" }],
      })
    ).toThrow(/page file/);
  });

  it("rejects invalid pageName (starts lowercase)", () => {
    expect(() =>
      GeneratedProjectSchema.parse({
        pageName: "loginPage",
        files: [{ path: "app/page.tsx", contents: "x", role: "page" }],
      })
    ).toThrow();
  });

  it("rejects empty files array", () => {
    expect(() =>
      GeneratedProjectSchema.parse({ pageName: "X", files: [] })
    ).toThrow();
  });
});

describe("GeneratedFileSchema", () => {
  it("rejects file with empty contents", () => {
    expect(() =>
      GeneratedFileSchema.parse({ path: "x.tsx", contents: "", role: "page" })
    ).toThrow();
  });
});
```

- [ ] **Step 2: Run — verify fails**

```bash
pnpm test:run tests/unit/schemas.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Create `src/lib/schemas.ts`**

```ts
import { z } from "zod";

export const GeoKindSchema = z.enum([
  "rectangle", "ellipse", "diamond", "triangle",
  "pentagon", "hexagon", "star", "oval",
]);

export const TextSizeSchema = z.enum(["s", "m", "l", "xl"]);

export const GeoShapeSchema = z.object({
  type: z.literal("geo"),
  id: z.string().min(1),
  x: z.number(),
  y: z.number(),
  w: z.number().positive(),
  h: z.number().positive(),
  props: z.object({
    geo: GeoKindSchema,
    text: z.string().optional(),
  }),
});

export const TextShapeSchema = z.object({
  type: z.literal("text"),
  id: z.string().min(1),
  x: z.number(),
  y: z.number(),
  props: z.object({
    text: z.string(),
    size: TextSizeSchema,
  }),
});

export const ArrowShapeSchema = z.object({
  type: z.literal("arrow"),
  id: z.string().min(1),
  props: z.object({
    start: z.object({ boundShapeId: z.string().optional() }),
    end: z.object({ boundShapeId: z.string().optional() }),
  }),
});

export const DrawShapeSchema = z.object({
  type: z.literal("draw"),
  id: z.string().min(1),
  props: z.object({
    segments: z.array(z.array(z.object({ x: z.number(), y: z.number() }))),
  }),
});

export const CanvasShapeSchema = z.discriminatedUnion("type", [
  GeoShapeSchema, TextShapeSchema, ArrowShapeSchema, DrawShapeSchema,
]);

export const GeneratedFileSchema = z.object({
  path: z.string().min(1),
  contents: z.string().min(1),
  role: z.enum(["page", "component"]),
});

export const GeneratedProjectSchema = z
  .object({
    pageName: z.string().min(1).max(64).regex(/^[A-Z][A-Za-z0-9]*$/, "must be PascalCase"),
    files: z.array(GeneratedFileSchema).min(1),
  })
  .refine((p) => p.files.some((f) => f.role === "page"), {
    message: "must include at least one page file",
  });

export type CanvasShape = z.infer<typeof CanvasShapeSchema>;
export type GeneratedFile = z.infer<typeof GeneratedFileSchema>;
export type GeneratedProject = z.infer<typeof GeneratedProjectSchema>;
```

- [ ] **Step 4: Run — verify passes**

```bash
pnpm test:run tests/unit/schemas.test.ts
```

Expected: PASS (8 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/schemas.ts tests/unit/schemas.test.ts
git commit -m "feat: zod schemas for CanvasShape and GeneratedProject"
```

---

### Task 10: Allowed shadcn component whitelist

**Files:**
- Create: `src/lib/allowed-components.ts`
- Test: `tests/unit/allowed-components.test.ts`

- [ ] **Step 1: Write failing test**

Create `tests/unit/allowed-components.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { ALLOWED_SHADCN, isAllowedImport } from "@/lib/allowed-components";

describe("allowed-components", () => {
  it("includes common primitives", () => {
    expect(ALLOWED_SHADCN).toContain("Button");
    expect(ALLOWED_SHADCN).toContain("Card");
    expect(ALLOWED_SHADCN).toContain("Dialog");
  });

  it("rejects hallucinated components", () => {
    expect(isAllowedImport("MagicalDialog")).toBe(false);
    expect(isAllowedImport("GlowyPanel")).toBe(false);
  });

  it("accepts whitelisted components", () => {
    expect(isAllowedImport("Button")).toBe(true);
    expect(isAllowedImport("Dialog")).toBe(true);
  });
});
```

- [ ] **Step 2: Run — verify fails**

```bash
pnpm test:run tests/unit/allowed-components.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Create `src/lib/allowed-components.ts`**

```ts
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
```

- [ ] **Step 4: Run — verify passes**

```bash
pnpm test:run tests/unit/allowed-components.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/allowed-components.ts tests/unit/allowed-components.test.ts
git commit -m "feat: whitelist of generatable shadcn components"
```

---

## Phase 2 — OpenRouter Proxy & Client (Tasks 11–13)

### Task 11: `/api/openrouter` proxy route

**Files:**
- Create: `src/app/api/openrouter/route.ts`
- Test: `tests/unit/openrouter-route.test.ts`

- [ ] **Step 1: Write failing test**

Create `tests/unit/openrouter-route.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/openrouter/route";

describe("/api/openrouter POST", () => {
  const fetchSpy = vi.spyOn(globalThis, "fetch");
  beforeEach(() => fetchSpy.mockReset());

  it("forwards the request to OpenRouter with correct headers", async () => {
    fetchSpy.mockResolvedValue(new Response("{\"ok\":true}", { status: 200 }));
    const req = new Request("http://localhost/api/openrouter", {
      method: "POST",
      headers: { Authorization: "Bearer sk-user-key", "content-type": "application/json" },
      body: JSON.stringify({ model: "anthropic/claude-sonnet-4.6", messages: [] }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(fetchSpy).toHaveBeenCalledOnce();
    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe("https://openrouter.ai/api/v1/chat/completions");
    const headers = init?.headers as Record<string, string>;
    expect(headers["Authorization"]).toBe("Bearer sk-user-key");
    expect(headers["HTTP-Referer"]).toBeTruthy();
    expect(headers["X-Title"]).toBe("Sketch2App");
  });

  it("returns 401 when Authorization header is missing", async () => {
    const req = new Request("http://localhost/api/openrouter", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{}",
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("propagates upstream status code on error", async () => {
    fetchSpy.mockResolvedValue(new Response("nope", { status: 402 }));
    const req = new Request("http://localhost/api/openrouter", {
      method: "POST",
      headers: { Authorization: "Bearer x", "content-type": "application/json" },
      body: "{}",
    });
    const res = await POST(req);
    expect(res.status).toBe(402);
  });
});
```

- [ ] **Step 2: Run — verify fails**

```bash
pnpm test:run tests/unit/openrouter-route.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Create `src/app/api/openrouter/route.ts`**

```ts
import { NextRequest } from "next/server";

export const runtime = "edge";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export async function POST(req: Request | NextRequest) {
  const auth = req.headers.get("authorization") ?? req.headers.get("Authorization");
  if (!auth || !auth.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }

  const body = await req.text();
  const upstream = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: auth,
      "content-type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "https://sketch2app.local",
      "X-Title": "Sketch2App",
    },
    body,
  });

  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      "content-type": upstream.headers.get("content-type") ?? "application/json",
    },
  });
}
```

- [ ] **Step 4: Run — verify passes**

```bash
pnpm test:run tests/unit/openrouter-route.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/openrouter/route.ts tests/unit/openrouter-route.test.ts
git commit -m "feat: OpenRouter proxy route with auth gate"
```

---

### Task 12: OpenRouter client wrapper

**Files:**
- Create: `src/lib/openrouter.ts`
- Test: `tests/unit/openrouter-client.test.ts`

- [ ] **Step 1: Write failing test**

Create `tests/unit/openrouter-client.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { callOpenRouter, OpenRouterError } from "@/lib/openrouter";

describe("callOpenRouter", () => {
  const fetchSpy = vi.spyOn(globalThis, "fetch");
  beforeEach(() => fetchSpy.mockReset());

  it("returns parsed content on success", async () => {
    fetchSpy.mockResolvedValue(
      new Response(
        JSON.stringify({ choices: [{ message: { content: '{"ok":true}' } }] }),
        { status: 200 }
      )
    );
    const res = await callOpenRouter({
      apiKey: "sk-x", model: "x/y", messages: [{ role: "user", content: "hi" }],
    });
    expect(res).toBe('{"ok":true}');
  });

  it("throws OpenRouterError on 401", async () => {
    fetchSpy.mockResolvedValue(new Response("{}", { status: 401 }));
    await expect(
      callOpenRouter({ apiKey: "bad", model: "x", messages: [] })
    ).rejects.toThrow(OpenRouterError);
  });

  it("exposes HTTP status on error", async () => {
    fetchSpy.mockResolvedValue(new Response("{}", { status: 402 }));
    try {
      await callOpenRouter({ apiKey: "x", model: "x", messages: [] });
    } catch (e) {
      expect((e as OpenRouterError).status).toBe(402);
    }
  });
});
```

- [ ] **Step 2: Run — verify fails**

```bash
pnpm test:run tests/unit/openrouter-client.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Create `src/lib/openrouter.ts`**

```ts
export type OpenRouterMessage =
  | { role: "system" | "assistant"; content: string }
  | { role: "user"; content: string | Array<
      | { type: "text"; text: string }
      | { type: "image_url"; image_url: { url: string } }
    > };

export interface CallOpenRouterOptions {
  apiKey: string;
  model: string;
  messages: OpenRouterMessage[];
  responseFormat?: "json_object" | "text";
  stream?: boolean;
}

export class OpenRouterError extends Error {
  constructor(message: string, public status: number, public body?: string) {
    super(message);
    this.name = "OpenRouterError";
  }
}

export async function callOpenRouter(opts: CallOpenRouterOptions): Promise<string> {
  const res = await fetch("/api/openrouter", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${opts.apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: opts.model,
      messages: opts.messages,
      ...(opts.responseFormat === "json_object"
        ? { response_format: { type: "json_object" } }
        : {}),
      stream: Boolean(opts.stream),
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new OpenRouterError(`OpenRouter error ${res.status}`, res.status, body);
  }
  const data = (await res.json()) as {
    choices: Array<{ message: { content: string } }>;
  };
  return data.choices[0]?.message?.content ?? "";
}
```

- [ ] **Step 4: Run — verify passes**

```bash
pnpm test:run tests/unit/openrouter-client.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/openrouter.ts tests/unit/openrouter-client.test.ts
git commit -m "feat: OpenRouter client wrapper with typed errors"
```

---

### Task 13: Streaming response helper

**Files:**
- Create: `src/lib/openrouter-stream.ts`
- Test: `tests/unit/openrouter-stream.test.ts`

- [ ] **Step 1: Write failing test**

Create `tests/unit/openrouter-stream.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { parseSseStream } from "@/lib/openrouter-stream";

function sse(lines: string[]) {
  const enc = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    start(controller) {
      for (const l of lines) controller.enqueue(enc.encode(l + "\n\n"));
      controller.close();
    },
  });
}

describe("parseSseStream", () => {
  it("yields text deltas in order", async () => {
    const stream = sse([
      'data: {"choices":[{"delta":{"content":"Hel"}}]}',
      'data: {"choices":[{"delta":{"content":"lo"}}]}',
      'data: [DONE]',
    ]);
    const chunks: string[] = [];
    for await (const c of parseSseStream(stream)) chunks.push(c);
    expect(chunks.join("")).toBe("Hello");
  });

  it("ignores malformed lines", async () => {
    const stream = sse([
      'data: {not json}',
      'data: {"choices":[{"delta":{"content":"OK"}}]}',
      'data: [DONE]',
    ]);
    const chunks: string[] = [];
    for await (const c of parseSseStream(stream)) chunks.push(c);
    expect(chunks.join("")).toBe("OK");
  });
});
```

- [ ] **Step 2: Run — verify fails**

```bash
pnpm test:run tests/unit/openrouter-stream.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Create `src/lib/openrouter-stream.ts`**

```ts
import { createParser, EventSourceMessage } from "eventsource-parser";

export async function* parseSseStream(
  stream: ReadableStream<Uint8Array>
): AsyncGenerator<string, void, void> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  const queue: string[] = [];
  let done = false;

  const parser = createParser({
    onEvent(event: EventSourceMessage) {
      if (event.data === "[DONE]") return;
      try {
        const parsed = JSON.parse(event.data);
        const delta = parsed?.choices?.[0]?.delta?.content;
        if (typeof delta === "string") queue.push(delta);
      } catch {
        // skip malformed
      }
    },
  });

  while (!done) {
    const { value, done: d } = await reader.read();
    done = d;
    if (value) parser.feed(decoder.decode(value, { stream: true }));
    while (queue.length) yield queue.shift()!;
  }
}
```

- [ ] **Step 4: Run — verify passes**

```bash
pnpm test:run tests/unit/openrouter-stream.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/openrouter-stream.ts tests/unit/openrouter-stream.test.ts
git commit -m "feat: SSE parser for OpenRouter streams"
```

---

## Phase 3 — Pipeline Core (Tasks 14–17)

### Task 14: Codegen prompt builder

**Files:**
- Create: `src/lib/prompts/codegen.ts`
- Test: `tests/unit/prompts-codegen.test.ts`

- [ ] **Step 1: Write failing test**

Create `tests/unit/prompts-codegen.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { buildCodegenMessages } from "@/lib/prompts/codegen";

describe("buildCodegenMessages", () => {
  it("embeds the canvas JSON and component whitelist", () => {
    const msgs = buildCodegenMessages({
      shapes: [{ type: "geo", id: "s1", x: 0, y: 0, w: 10, h: 10, props: { geo: "rectangle", text: "Hi" } }],
    });
    expect(msgs.length).toBeGreaterThanOrEqual(2);
    const systemText = msgs[0].content as string;
    expect(systemText).toMatch(/shadcn/i);
    expect(systemText).toMatch(/Button/);
    const userText = msgs[1].content as string;
    expect(userText).toContain('"type":"geo"');
  });

  it("includes prior project when iterating", () => {
    const msgs = buildCodegenMessages({
      shapes: [],
      currentProject: { pageName: "LoginPage", files: [{ path: "app/page.tsx", contents: "x", role: "page" }] },
      instruction: "make the header red",
    });
    const text = (msgs[1].content as string);
    expect(text).toContain("make the header red");
    expect(text).toContain("LoginPage");
  });
});
```

- [ ] **Step 2: Run — verify fails**

```bash
pnpm test:run tests/unit/prompts-codegen.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Create `src/lib/prompts/codegen.ts`**

```ts
import { ALLOWED_SHADCN } from "@/lib/allowed-components";
import type { CanvasShape, GeneratedProject } from "@/lib/schemas";
import type { OpenRouterMessage } from "@/lib/openrouter";

export interface CodegenInput {
  shapes: CanvasShape[];
  currentProject?: GeneratedProject;
  instruction?: string;
  retryNote?: string;
}

export function buildCodegenMessages(input: CodegenInput): OpenRouterMessage[] {
  const system = `You generate React code from wireframe shape data.

Output strict JSON matching this schema (no prose, no markdown):
{ "pageName": "PascalCase", "files": [{ "path": string, "contents": string, "role": "page"|"component" }] }

Rules:
- Use ONLY these shadcn components: ${ALLOWED_SHADCN.join(", ")}
- Use Tailwind classes for styling. No external CSS.
- TypeScript + JSX (".tsx") files only.
- The page file path MUST be "app/page.tsx".
- Sub-components go under "components/<Name>.tsx" and import via "@/components/<name>".
- Decompose repeated or nontrivial regions into named sub-components.
- Keep imports minimal and valid.
- Do NOT include package.json, tsconfig, or README.`;

  const user =
    input.instruction && input.currentProject
      ? `User refinement request: ${input.instruction}

Original canvas shapes:
${JSON.stringify(input.shapes)}

Current project (update this — minimal changes, preserve structure):
${JSON.stringify(input.currentProject)}${input.retryNote ? `\n\nRetry note: ${input.retryNote}` : ""}`
      : `Canvas shapes:
${JSON.stringify(input.shapes)}

Produce the full project as JSON per the schema.${input.retryNote ? `\n\nRetry note: ${input.retryNote}` : ""}`;

  return [
    { role: "system", content: system },
    { role: "user", content: user },
  ];
}
```

- [ ] **Step 4: Run — verify passes**

```bash
pnpm test:run tests/unit/prompts-codegen.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/prompts/codegen.ts tests/unit/prompts-codegen.test.ts
git commit -m "feat: codegen prompt builder with shadcn whitelist"
```

---

### Task 15: Codegen orchestrator with retry (contract tests)

**Files:**
- Create: `src/lib/pipeline/codegen.ts`, `tests/fixtures/codegen-valid.json`, `tests/fixtures/codegen-invalid.json`
- Test: `tests/contract/codegen.test.ts`

- [ ] **Step 1: Create fixtures**

`tests/fixtures/codegen-valid.json`:

```json
{
  "pageName": "LoginPage",
  "files": [
    { "path": "app/page.tsx", "contents": "export default function Page(){return <div>Hi</div>}", "role": "page" },
    { "path": "components/LoginForm.tsx", "contents": "export function LoginForm(){return <form/>}", "role": "component" }
  ]
}
```

`tests/fixtures/codegen-invalid.json`:

```json
{ "pageName": "x", "files": [] }
```

- [ ] **Step 2: Write failing test**

Create `tests/contract/codegen.test.ts`:

```ts
import { describe, it, expect, vi } from "vitest";
import { runCodegen } from "@/lib/pipeline/codegen";
import * as or from "@/lib/openrouter";
import valid from "../fixtures/codegen-valid.json";
import invalid from "../fixtures/codegen-invalid.json";

describe("runCodegen", () => {
  it("returns a parsed project on valid response", async () => {
    vi.spyOn(or, "callOpenRouter").mockResolvedValueOnce(JSON.stringify(valid));
    const res = await runCodegen({ shapes: [], apiKey: "x", model: "m" });
    expect(res.pageName).toBe("LoginPage");
    expect(res.files).toHaveLength(2);
  });

  it("retries once on invalid JSON structure, then succeeds", async () => {
    const spy = vi.spyOn(or, "callOpenRouter")
      .mockResolvedValueOnce(JSON.stringify(invalid))
      .mockResolvedValueOnce(JSON.stringify(valid));
    const res = await runCodegen({ shapes: [], apiKey: "x", model: "m" });
    expect(spy).toHaveBeenCalledTimes(2);
    expect(res.pageName).toBe("LoginPage");
  });

  it("throws after second failure", async () => {
    vi.spyOn(or, "callOpenRouter").mockResolvedValue(JSON.stringify(invalid));
    await expect(runCodegen({ shapes: [], apiKey: "x", model: "m" })).rejects.toThrow(/codegen/i);
  });

  it("throws when content is not JSON at all", async () => {
    vi.spyOn(or, "callOpenRouter").mockResolvedValue("not json");
    await expect(runCodegen({ shapes: [], apiKey: "x", model: "m" })).rejects.toThrow();
  });
});
```

- [ ] **Step 3: Run — verify fails**

```bash
pnpm test:run tests/contract/codegen.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 4: Create `src/lib/pipeline/codegen.ts`**

```ts
import { GeneratedProjectSchema, type CanvasShape, type GeneratedProject } from "@/lib/schemas";
import { buildCodegenMessages } from "@/lib/prompts/codegen";
import { callOpenRouter } from "@/lib/openrouter";

export interface RunCodegenOptions {
  shapes: CanvasShape[];
  apiKey: string;
  model: string;
  currentProject?: GeneratedProject;
  instruction?: string;
}

export class CodegenError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = "CodegenError";
  }
}

async function attempt(opts: RunCodegenOptions, retryNote?: string): Promise<GeneratedProject> {
  const messages = buildCodegenMessages({
    shapes: opts.shapes,
    currentProject: opts.currentProject,
    instruction: opts.instruction,
    retryNote,
  });
  const content = await callOpenRouter({
    apiKey: opts.apiKey, model: opts.model, messages, responseFormat: "json_object",
  });
  const parsed = JSON.parse(content);
  return GeneratedProjectSchema.parse(parsed);
}

export async function runCodegen(opts: RunCodegenOptions): Promise<GeneratedProject> {
  try {
    return await attempt(opts);
  } catch (firstErr) {
    try {
      return await attempt(opts, `Your previous response failed validation: ${(firstErr as Error).message}. Return valid JSON matching the schema.`);
    } catch (secondErr) {
      throw new CodegenError(`codegen failed after retry: ${(secondErr as Error).message}`, secondErr);
    }
  }
}
```

- [ ] **Step 5: Run — verify passes**

```bash
pnpm test:run tests/contract/codegen.test.ts
```

Expected: PASS (4 tests).

- [ ] **Step 6: Commit**

```bash
git add src/lib/pipeline/codegen.ts tests/fixtures tests/contract/codegen.test.ts
git commit -m "feat: codegen orchestrator with single-retry and schema validation"
```

---

### Task 16: Vision normalizer (photo → CanvasShape[])

**Files:**
- Create: `src/lib/prompts/vision.ts`, `src/lib/pipeline/vision.ts`, `tests/fixtures/vision-valid.json`
- Test: `tests/contract/vision.test.ts`

- [ ] **Step 1: Create fixture**

`tests/fixtures/vision-valid.json`:

```json
{
  "shapes": [
    { "type": "geo", "id": "v1", "x": 50, "y": 50, "w": 400, "h": 60, "props": { "geo": "rectangle", "text": "HEADER" } },
    { "type": "text", "id": "v2", "x": 60, "y": 70, "props": { "text": "Welcome", "size": "l" } }
  ]
}
```

- [ ] **Step 2: Write failing test**

Create `tests/contract/vision.test.ts`:

```ts
import { describe, it, expect, vi } from "vitest";
import { normalizePhotoToShapes } from "@/lib/pipeline/vision";
import * as or from "@/lib/openrouter";
import valid from "../fixtures/vision-valid.json";

describe("normalizePhotoToShapes", () => {
  it("parses shapes array from vision response", async () => {
    vi.spyOn(or, "callOpenRouter").mockResolvedValueOnce(JSON.stringify(valid));
    const shapes = await normalizePhotoToShapes({
      imageDataUrl: "data:image/png;base64,AAAA",
      apiKey: "x", model: "anthropic/claude-sonnet-4.6",
    });
    expect(shapes).toHaveLength(2);
    expect(shapes[0].type).toBe("geo");
  });

  it("retries once on invalid JSON, then succeeds", async () => {
    const spy = vi.spyOn(or, "callOpenRouter")
      .mockResolvedValueOnce("not json")
      .mockResolvedValueOnce(JSON.stringify(valid));
    await normalizePhotoToShapes({
      imageDataUrl: "data:image/png;base64,AAAA",
      apiKey: "x", model: "m",
    });
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it("throws when zero shapes are detected", async () => {
    vi.spyOn(or, "callOpenRouter").mockResolvedValueOnce(JSON.stringify({ shapes: [] }));
    await expect(
      normalizePhotoToShapes({ imageDataUrl: "data:image/png;base64,A", apiKey: "x", model: "m" })
    ).rejects.toThrow(/no shapes/i);
  });
});
```

- [ ] **Step 3: Run — verify fails**

```bash
pnpm test:run tests/contract/vision.test.ts
```

Expected: FAIL.

- [ ] **Step 4: Create `src/lib/prompts/vision.ts`**

```ts
import type { OpenRouterMessage } from "@/lib/openrouter";

export function buildVisionMessages(imageDataUrl: string): OpenRouterMessage[] {
  const system = `You are a wireframe interpreter. Look at the image and identify each hand-drawn element.

Return strict JSON (no prose, no markdown):
{ "shapes": [
    { "type": "geo", "id": string, "x": number, "y": number, "w": number, "h": number,
      "props": { "geo": "rectangle"|"ellipse"|"diamond"|"triangle"|"pentagon"|"hexagon"|"star"|"oval", "text"?: string } }
  | { "type": "text", "id": string, "x": number, "y": number, "props": { "text": string, "size": "s"|"m"|"l"|"xl" } }
  | { "type": "arrow", "id": string, "props": { "start": { "boundShapeId"?: string }, "end": { "boundShapeId"?: string } } }
] }

Estimate positions and sizes on a 1024x768 canvas. Ignore shading and noise. Give each shape a unique id.`;
  return [
    { role: "system", content: system },
    { role: "user", content: [
        { type: "text", text: "Identify the wireframe elements in this image." },
        { type: "image_url", image_url: { url: imageDataUrl } },
      ] },
  ];
}
```

- [ ] **Step 5: Create `src/lib/pipeline/vision.ts`**

```ts
import { z } from "zod";
import { CanvasShapeSchema, type CanvasShape } from "@/lib/schemas";
import { buildVisionMessages } from "@/lib/prompts/vision";
import { callOpenRouter } from "@/lib/openrouter";

export interface NormalizePhotoOptions {
  imageDataUrl: string;
  apiKey: string;
  model: string;
}

const VisionResponseSchema = z.object({ shapes: z.array(CanvasShapeSchema) });

export class VisionError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = "VisionError";
  }
}

async function attempt(opts: NormalizePhotoOptions): Promise<CanvasShape[]> {
  const messages = buildVisionMessages(opts.imageDataUrl);
  const content = await callOpenRouter({
    apiKey: opts.apiKey, model: opts.model, messages, responseFormat: "json_object",
  });
  const parsed = VisionResponseSchema.parse(JSON.parse(content));
  if (parsed.shapes.length === 0) throw new VisionError("no shapes detected");
  return parsed.shapes;
}

export async function normalizePhotoToShapes(opts: NormalizePhotoOptions): Promise<CanvasShape[]> {
  try {
    return await attempt(opts);
  } catch (firstErr) {
    if (firstErr instanceof VisionError) throw firstErr; // don't retry "no shapes"
    try {
      return await attempt(opts);
    } catch (secondErr) {
      throw new VisionError(`vision failed after retry: ${(secondErr as Error).message}`, secondErr);
    }
  }
}
```

- [ ] **Step 6: Run — verify passes**

```bash
pnpm test:run tests/contract/vision.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/lib/prompts/vision.ts src/lib/pipeline/vision.ts tests/fixtures/vision-valid.json tests/contract/vision.test.ts
git commit -m "feat: photo->CanvasShape vision pipeline with retry"
```

---

### Task 17: Iteration orchestrator

**Files:**
- Modify: `src/lib/pipeline/codegen.ts` (already supports iteration via `currentProject` + `instruction`)
- Create: `src/lib/pipeline/iterate.ts` (thin wrapper for UX clarity)
- Test: `tests/contract/iterate.test.ts`

- [ ] **Step 1: Write failing test**

Create `tests/contract/iterate.test.ts`:

```ts
import { describe, it, expect, vi } from "vitest";
import { runIteration } from "@/lib/pipeline/iterate";
import * as or from "@/lib/openrouter";
import valid from "../fixtures/codegen-valid.json";

describe("runIteration", () => {
  it("returns updated project when model responds well", async () => {
    vi.spyOn(or, "callOpenRouter").mockResolvedValueOnce(JSON.stringify(valid));
    const res = await runIteration({
      instruction: "make header red",
      currentProject: { pageName: "Old", files: [{ path: "app/page.tsx", contents: "x", role: "page" }] },
      canvasShapes: [],
      apiKey: "x", model: "m",
    });
    expect(res.pageName).toBe("LoginPage");
  });

  it("falls back to previous page file when model omits one", async () => {
    const onlyComponent = {
      pageName: "LoginPage",
      files: [{ path: "components/Form.tsx", contents: "x", role: "component" }],
    };
    vi.spyOn(or, "callOpenRouter").mockResolvedValueOnce(JSON.stringify(onlyComponent));
    const current = {
      pageName: "LoginPage",
      files: [
        { path: "app/page.tsx", contents: "original", role: "page" as const },
        { path: "components/Old.tsx", contents: "old", role: "component" as const },
      ],
    };
    const res = await runIteration({
      instruction: "tweak", currentProject: current, canvasShapes: [], apiKey: "x", model: "m",
    });
    expect(res.files.find(f => f.role === "page")?.contents).toBe("original");
    expect(res.files.find(f => f.path === "components/Form.tsx")).toBeDefined();
  });
});
```

- [ ] **Step 2: Run — verify fails**

```bash
pnpm test:run tests/contract/iterate.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Create `src/lib/pipeline/iterate.ts`**

```ts
import { runCodegen } from "@/lib/pipeline/codegen";
import type { CanvasShape, GeneratedProject } from "@/lib/schemas";

export interface IterateOptions {
  instruction: string;
  currentProject: GeneratedProject;
  canvasShapes: CanvasShape[];
  apiKey: string;
  model: string;
}

export async function runIteration(opts: IterateOptions): Promise<GeneratedProject> {
  try {
    return await runCodegen({
      shapes: opts.canvasShapes,
      apiKey: opts.apiKey,
      model: opts.model,
      currentProject: opts.currentProject,
      instruction: opts.instruction,
    });
  } catch (e) {
    throw e;
  }
}

// Called only when validated project lacks a page file — preserves the previous one.
export function mergeWithPreservedPage(
  updated: { pageName: string; files: GeneratedProject["files"] },
  previous: GeneratedProject
): GeneratedProject {
  const hasPage = updated.files.some((f) => f.role === "page");
  if (hasPage) return updated as GeneratedProject;
  const prevPage = previous.files.find((f) => f.role === "page");
  if (!prevPage) return updated as GeneratedProject;
  return { pageName: updated.pageName, files: [prevPage, ...updated.files] };
}
```

- [ ] **Step 4: Update `src/lib/pipeline/codegen.ts` to apply page fallback**

Modify `attempt` in `codegen.ts` — replace the final `return` line with:

```ts
  const parsed = JSON.parse(content);
  try {
    return GeneratedProjectSchema.parse(parsed);
  } catch (schemaErr) {
    // Only salvage during iteration: missing page file is recoverable
    if (opts.currentProject) {
      const { mergeWithPreservedPage } = await import("@/lib/pipeline/iterate");
      const salvaged = mergeWithPreservedPage(parsed, opts.currentProject);
      return GeneratedProjectSchema.parse(salvaged);
    }
    throw schemaErr;
  }
```

- [ ] **Step 5: Run — verify passes**

```bash
pnpm test:run tests/contract/iterate.test.ts tests/contract/codegen.test.ts
```

Expected: PASS (all tests in both files).

- [ ] **Step 6: Commit**

```bash
git add src/lib/pipeline/iterate.ts src/lib/pipeline/codegen.ts tests/contract/iterate.test.ts
git commit -m "feat: iteration orchestrator with page-file preservation fallback"
```

---

## Phase 4 — State Contexts (Tasks 18–20)

### Task 18: ApiKeyContext

**Files:**
- Create: `src/contexts/api-key-context.tsx`
- Test: `tests/unit/api-key-context.test.tsx`

- [ ] **Step 1: Write failing test**

Create `tests/unit/api-key-context.test.tsx`:

```tsx
import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { ApiKeyProvider, useApiKey } from "@/contexts/api-key-context";
import { PropsWithChildren } from "react";

const wrapper = ({ children }: PropsWithChildren) => <ApiKeyProvider>{children}</ApiKeyProvider>;

describe("ApiKeyContext", () => {
  beforeEach(() => localStorage.clear());

  it("initial key is null", () => {
    const { result } = renderHook(() => useApiKey(), { wrapper });
    expect(result.current.apiKey).toBeNull();
  });

  it("setApiKey persists to localStorage", () => {
    const { result } = renderHook(() => useApiKey(), { wrapper });
    act(() => result.current.setApiKey("sk-test"));
    expect(result.current.apiKey).toBe("sk-test");
    expect(localStorage.getItem("sketch2app:or-key")).toBe("sk-test");
  });

  it("clearApiKey removes the key", () => {
    localStorage.setItem("sketch2app:or-key", "sk-existing");
    const { result } = renderHook(() => useApiKey(), { wrapper });
    act(() => result.current.clearApiKey());
    expect(result.current.apiKey).toBeNull();
    expect(localStorage.getItem("sketch2app:or-key")).toBeNull();
  });
});
```

- [ ] **Step 2: Run — verify fails**

```bash
pnpm test:run tests/unit/api-key-context.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Create `src/contexts/api-key-context.tsx`**

```tsx
"use client";
import { createContext, useCallback, useContext, useEffect, useState, PropsWithChildren } from "react";

const STORAGE_KEY = "sketch2app:or-key";

interface ApiKeyCtx {
  apiKey: string | null;
  setApiKey: (key: string) => void;
  clearApiKey: () => void;
}

const Ctx = createContext<ApiKeyCtx | null>(null);

export function ApiKeyProvider({ children }: PropsWithChildren) {
  const [apiKey, setApiKeyState] = useState<string | null>(null);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (stored) setApiKeyState(stored);
  }, []);

  const setApiKey = useCallback((key: string) => {
    localStorage.setItem(STORAGE_KEY, key);
    setApiKeyState(key);
  }, []);

  const clearApiKey = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setApiKeyState(null);
  }, []);

  return <Ctx.Provider value={{ apiKey, setApiKey, clearApiKey }}>{children}</Ctx.Provider>;
}

export function useApiKey() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApiKey must be used inside ApiKeyProvider");
  return ctx;
}
```

- [ ] **Step 4: Run — verify passes**

```bash
pnpm test:run tests/unit/api-key-context.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/contexts/api-key-context.tsx tests/unit/api-key-context.test.tsx
git commit -m "feat: ApiKeyContext with localStorage persistence"
```

---

### Task 19: ModelContext

**Files:**
- Create: `src/contexts/model-context.tsx`, `src/lib/models.ts`
- Test: `tests/unit/model-context.test.tsx`

- [ ] **Step 1: Create `src/lib/models.ts`**

```ts
export interface ModelOption {
  id: string;           // OpenRouter model id
  label: string;
  supportsVision: boolean;
}

export const MODELS: ModelOption[] = [
  { id: "anthropic/claude-sonnet-4.6", label: "Claude Sonnet 4.6", supportsVision: true },
  { id: "anthropic/claude-opus-4.6", label: "Claude Opus 4.6", supportsVision: true },
  { id: "openai/gpt-4o", label: "GPT-4o", supportsVision: true },
  { id: "google/gemini-2.0-flash-exp:free", label: "Gemini 2.0 Flash", supportsVision: true },
  { id: "anthropic/claude-haiku-4.5", label: "Claude Haiku 4.5", supportsVision: false },
];

export const DEFAULT_MODEL_ID = "anthropic/claude-sonnet-4.6";

export function findModel(id: string): ModelOption | undefined {
  return MODELS.find((m) => m.id === id);
}
```

- [ ] **Step 2: Write failing test**

Create `tests/unit/model-context.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { ModelProvider, useModel } from "@/contexts/model-context";
import { PropsWithChildren } from "react";

const wrapper = ({ children }: PropsWithChildren) => <ModelProvider>{children}</ModelProvider>;

describe("ModelContext", () => {
  it("defaults to Claude Sonnet 4.6", () => {
    const { result } = renderHook(() => useModel(), { wrapper });
    expect(result.current.model.id).toBe("anthropic/claude-sonnet-4.6");
  });

  it("setModelById switches to a valid model", () => {
    const { result } = renderHook(() => useModel(), { wrapper });
    act(() => result.current.setModelById("openai/gpt-4o"));
    expect(result.current.model.id).toBe("openai/gpt-4o");
  });

  it("throws for unknown model id", () => {
    const { result } = renderHook(() => useModel(), { wrapper });
    expect(() => act(() => result.current.setModelById("bogus/model"))).toThrow();
  });
});
```

- [ ] **Step 3: Run — verify fails**

```bash
pnpm test:run tests/unit/model-context.test.tsx
```

Expected: FAIL.

- [ ] **Step 4: Create `src/contexts/model-context.tsx`**

```tsx
"use client";
import { createContext, useCallback, useContext, useState, PropsWithChildren } from "react";
import { MODELS, DEFAULT_MODEL_ID, findModel, type ModelOption } from "@/lib/models";

interface ModelCtx {
  model: ModelOption;
  setModelById: (id: string) => void;
  models: ModelOption[];
}

const Ctx = createContext<ModelCtx | null>(null);

export function ModelProvider({ children }: PropsWithChildren) {
  const [modelId, setModelId] = useState<string>(DEFAULT_MODEL_ID);
  const setModelById = useCallback((id: string) => {
    if (!findModel(id)) throw new Error(`Unknown model: ${id}`);
    setModelId(id);
  }, []);
  const model = findModel(modelId)!;
  return <Ctx.Provider value={{ model, setModelById, models: MODELS }}>{children}</Ctx.Provider>;
}

export function useModel() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useModel must be used inside ModelProvider");
  return ctx;
}
```

- [ ] **Step 5: Run — verify passes**

```bash
pnpm test:run tests/unit/model-context.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/models.ts src/contexts/model-context.tsx tests/unit/model-context.test.tsx
git commit -m "feat: ModelContext with OpenRouter model catalog"
```

---

### Task 20: ProjectContext

**Files:**
- Create: `src/contexts/project-context.tsx`
- Test: `tests/unit/project-context.test.tsx`

- [ ] **Step 1: Write failing test**

Create `tests/unit/project-context.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { ProjectProvider, useProject } from "@/contexts/project-context";
import { PropsWithChildren } from "react";

const wrapper = ({ children }: PropsWithChildren) => <ProjectProvider>{children}</ProjectProvider>;

describe("ProjectContext", () => {
  it("starts empty", () => {
    const { result } = renderHook(() => useProject(), { wrapper });
    expect(result.current.project).toBeNull();
    expect(result.current.history).toHaveLength(0);
    expect(result.current.canvasShapes).toHaveLength(0);
  });

  it("setProject pushes previous to history", () => {
    const { result } = renderHook(() => useProject(), { wrapper });
    const p1 = { pageName: "A", files: [{ path: "app/page.tsx", contents: "1", role: "page" as const }] };
    const p2 = { pageName: "B", files: [{ path: "app/page.tsx", contents: "2", role: "page" as const }] };
    act(() => result.current.setProject(p1));
    act(() => result.current.setProject(p2));
    expect(result.current.project?.pageName).toBe("B");
    expect(result.current.history).toHaveLength(1);
    expect(result.current.history[0].pageName).toBe("A");
  });

  it("revert pops history back", () => {
    const { result } = renderHook(() => useProject(), { wrapper });
    const p1 = { pageName: "A", files: [{ path: "app/page.tsx", contents: "1", role: "page" as const }] };
    const p2 = { pageName: "B", files: [{ path: "app/page.tsx", contents: "2", role: "page" as const }] };
    act(() => result.current.setProject(p1));
    act(() => result.current.setProject(p2));
    act(() => result.current.revert());
    expect(result.current.project?.pageName).toBe("A");
    expect(result.current.history).toHaveLength(0);
  });

  it("appendChatMessage adds and caps at 5 turns", () => {
    const { result } = renderHook(() => useProject(), { wrapper });
    for (let i = 0; i < 7; i++) {
      act(() => result.current.appendChatMessage({ role: "user", content: `msg${i}` }));
    }
    expect(result.current.chatHistory).toHaveLength(5);
    expect(result.current.chatHistory[0].content).toBe("msg2");
  });

  it("canvasDirty flag", () => {
    const { result } = renderHook(() => useProject(), { wrapper });
    act(() => result.current.setCanvasShapes([{ type: "geo", id: "x", x:0, y:0, w:1, h:1, props: { geo: "rectangle" } }]));
    expect(result.current.canvasDirty).toBe(true);
    act(() => result.current.markCanvasClean());
    expect(result.current.canvasDirty).toBe(false);
  });
});
```

- [ ] **Step 2: Run — verify fails**

```bash
pnpm test:run tests/unit/project-context.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Create `src/contexts/project-context.tsx`**

```tsx
"use client";
import { createContext, useCallback, useContext, useState, PropsWithChildren } from "react";
import type { CanvasShape, GeneratedProject } from "@/lib/schemas";

export interface ChatMessage { role: "user" | "assistant"; content: string }

interface ProjectCtx {
  project: GeneratedProject | null;
  setProject: (p: GeneratedProject) => void;
  history: GeneratedProject[];
  revert: () => void;
  chatHistory: ChatMessage[];
  appendChatMessage: (m: ChatMessage) => void;
  canvasShapes: CanvasShape[];
  setCanvasShapes: (s: CanvasShape[]) => void;
  canvasDirty: boolean;
  markCanvasClean: () => void;
  reset: () => void;
}

const Ctx = createContext<ProjectCtx | null>(null);
const MAX_CHAT_TURNS = 5;

export function ProjectProvider({ children }: PropsWithChildren) {
  const [project, setProjectState] = useState<GeneratedProject | null>(null);
  const [history, setHistory] = useState<GeneratedProject[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [canvasShapes, setCanvasShapesState] = useState<CanvasShape[]>([]);
  const [canvasDirty, setCanvasDirty] = useState(false);

  const setProject = useCallback((p: GeneratedProject) => {
    setProjectState((prev) => {
      if (prev) setHistory((h) => [...h, prev]);
      return p;
    });
  }, []);

  const revert = useCallback(() => {
    setHistory((h) => {
      if (h.length === 0) return h;
      const previous = h[h.length - 1];
      setProjectState(previous);
      return h.slice(0, -1);
    });
  }, []);

  const appendChatMessage = useCallback((m: ChatMessage) => {
    setChatHistory((prev) => [...prev, m].slice(-MAX_CHAT_TURNS));
  }, []);

  const setCanvasShapes = useCallback((s: CanvasShape[]) => {
    setCanvasShapesState(s);
    setCanvasDirty(true);
  }, []);

  const markCanvasClean = useCallback(() => setCanvasDirty(false), []);

  const reset = useCallback(() => {
    setProjectState(null);
    setHistory([]);
    setChatHistory([]);
    setCanvasShapesState([]);
    setCanvasDirty(false);
  }, []);

  return (
    <Ctx.Provider value={{
      project, setProject, history, revert,
      chatHistory, appendChatMessage,
      canvasShapes, setCanvasShapes, canvasDirty, markCanvasClean,
      reset,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useProject() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useProject must be used inside ProjectProvider");
  return ctx;
}
```

- [ ] **Step 4: Run — verify passes**

```bash
pnpm test:run tests/unit/project-context.test.tsx
```

Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/contexts/project-context.tsx tests/unit/project-context.test.tsx
git commit -m "feat: ProjectContext with history, chat cap, canvas dirty flag"
```

---

## Phase 5 — UI Components (Tasks 21–33)

### Task 21: Bauhaus Logo

**Files:**
- Create: `src/components/logo.tsx`

- [ ] **Step 1: Create `src/components/logo.tsx`**

```tsx
export function Logo({ size = 32 }: { size?: number }) {
  const s = size;
  return (
    <div className="flex items-center gap-2" aria-label="Sketch2App">
      <div className="flex gap-1">
        <div className="rounded-full bg-bauhaus-red border-2 border-bauhaus-black" style={{ width: s / 2, height: s / 2 }} />
        <div className="bg-bauhaus-blue border-2 border-bauhaus-black" style={{ width: s / 2, height: s / 2 }} />
        <div className="border-2 border-bauhaus-black bg-bauhaus-yellow"
             style={{ width: 0, height: 0,
                      borderLeft: `${s/4}px solid transparent`,
                      borderRight: `${s/4}px solid transparent`,
                      borderBottom: `${s/2}px solid #F0C020`,
                      backgroundColor: "transparent" }} />
      </div>
      <span className="font-black uppercase tracking-tighter text-lg">Sketch2App</span>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
pnpm typecheck
```

- [ ] **Step 3: Commit**

```bash
git add src/components/logo.tsx
git commit -m "feat: Bauhaus geometric logo"
```

---

### Task 22: ApiKeyDialog

**Files:**
- Create: `src/components/api-key-dialog.tsx`
- Test: `tests/unit/api-key-dialog.test.tsx`

- [ ] **Step 1: Write failing test**

Create `tests/unit/api-key-dialog.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ApiKeyDialog } from "@/components/api-key-dialog";
import { ApiKeyProvider } from "@/contexts/api-key-context";

describe("ApiKeyDialog", () => {
  it("submits and persists the key", async () => {
    const user = userEvent.setup();
    render(
      <ApiKeyProvider>
        <ApiKeyDialog open onOpenChange={() => {}} />
      </ApiKeyProvider>
    );
    const input = screen.getByLabelText(/openrouter api key/i);
    await user.type(input, "sk-or-test123");
    await user.click(screen.getByRole("button", { name: /save/i }));
    expect(localStorage.getItem("sketch2app:or-key")).toBe("sk-or-test123");
  });
});
```

- [ ] **Step 2: Run — verify fails**

```bash
pnpm test:run tests/unit/api-key-dialog.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Create `src/components/api-key-dialog.tsx`**

```tsx
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
          <DialogTitle className="uppercase font-black tracking-tighter">OpenRouter API Key</DialogTitle>
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
```

- [ ] **Step 4: Run — verify passes**

```bash
pnpm test:run tests/unit/api-key-dialog.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/api-key-dialog.tsx tests/unit/api-key-dialog.test.tsx
git commit -m "feat: ApiKeyDialog with localStorage persistence"
```

---

### Task 23: ModelPicker

**Files:**
- Create: `src/components/model-picker.tsx`
- Test: `tests/unit/model-picker.test.tsx`

- [ ] **Step 1: Write failing test**

Create `tests/unit/model-picker.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ModelPicker } from "@/components/model-picker";
import { ModelProvider } from "@/contexts/model-context";

describe("ModelPicker", () => {
  it("shows the current model label", () => {
    render(<ModelProvider><ModelPicker /></ModelProvider>);
    expect(screen.getByRole("combobox")).toHaveTextContent(/claude sonnet/i);
  });

  it("lets user pick a different model", async () => {
    const user = userEvent.setup();
    render(<ModelProvider><ModelPicker /></ModelProvider>);
    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByRole("option", { name: /gpt-4o/i }));
    expect(screen.getByRole("combobox")).toHaveTextContent(/gpt-4o/i);
  });
});
```

- [ ] **Step 2: Run — verify fails**

```bash
pnpm test:run tests/unit/model-picker.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Create `src/components/model-picker.tsx`**

```tsx
"use client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useModel } from "@/contexts/model-context";

export function ModelPicker() {
  const { model, setModelById, models } = useModel();
  return (
    <Select value={model.id} onValueChange={setModelById}>
      <SelectTrigger className="w-[220px] border-2 border-bauhaus-black rounded-none font-bold uppercase text-xs tracking-wider bg-white">
        <SelectValue />
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
```

- [ ] **Step 4: Run — verify passes**

```bash
pnpm test:run tests/unit/model-picker.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/model-picker.tsx tests/unit/model-picker.test.tsx
git commit -m "feat: ModelPicker with vision-support annotation"
```

---

### Task 24: TldrawCanvas wrapper

**Files:**
- Create: `src/components/tldraw-canvas.tsx`, `src/lib/tldraw-to-shapes.ts`
- Test: `tests/unit/tldraw-to-shapes.test.ts`

- [ ] **Step 1: Write failing test for converter**

Create `tests/unit/tldraw-to-shapes.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { convertTldrawSnapshotToShapes } from "@/lib/tldraw-to-shapes";

describe("convertTldrawSnapshotToShapes", () => {
  it("extracts geo rectangle with text", () => {
    const snapshot = {
      store: {
        "shape:1": {
          id: "shape:1", typeName: "shape", type: "geo",
          x: 10, y: 20,
          props: { w: 100, h: 40, geo: "rectangle", text: "Header" },
        },
      },
    };
    const shapes = convertTldrawSnapshotToShapes(snapshot);
    expect(shapes).toHaveLength(1);
    expect(shapes[0]).toMatchObject({
      type: "geo", id: "shape:1", x: 10, y: 20, w: 100, h: 40,
      props: { geo: "rectangle", text: "Header" },
    });
  });

  it("skips non-shape records", () => {
    const snapshot = {
      store: {
        "document:doc": { typeName: "document" },
        "shape:1": { id: "shape:1", typeName: "shape", type: "text", x: 0, y: 0, props: { text: "Hi", size: "m" } },
      },
    };
    const shapes = convertTldrawSnapshotToShapes(snapshot);
    expect(shapes).toHaveLength(1);
    expect(shapes[0].type).toBe("text");
  });
});
```

- [ ] **Step 2: Run — verify fails**

```bash
pnpm test:run tests/unit/tldraw-to-shapes.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Create `src/lib/tldraw-to-shapes.ts`**

```ts
import type { CanvasShape } from "@/lib/schemas";

// Minimal shape of a tldraw store snapshot we care about
interface TldrawSnapshot {
  store: Record<string, any>;
}

export function convertTldrawSnapshotToShapes(snapshot: TldrawSnapshot): CanvasShape[] {
  const out: CanvasShape[] = [];
  for (const record of Object.values(snapshot.store ?? {})) {
    if (!record || record.typeName !== "shape") continue;
    switch (record.type) {
      case "geo":
        out.push({
          type: "geo", id: record.id,
          x: record.x ?? 0, y: record.y ?? 0,
          w: record.props?.w ?? 1, h: record.props?.h ?? 1,
          props: { geo: record.props?.geo ?? "rectangle", text: record.props?.text || undefined },
        });
        break;
      case "text":
        out.push({
          type: "text", id: record.id,
          x: record.x ?? 0, y: record.y ?? 0,
          props: { text: record.props?.text ?? "", size: record.props?.size ?? "m" },
        });
        break;
      case "arrow":
        out.push({
          type: "arrow", id: record.id,
          props: {
            start: { boundShapeId: record.props?.start?.boundShapeId },
            end: { boundShapeId: record.props?.end?.boundShapeId },
          },
        });
        break;
      case "draw":
        out.push({
          type: "draw", id: record.id,
          props: { segments: record.props?.segments?.map((s: any) => s.points ?? s) ?? [] },
        });
        break;
    }
  }
  return out;
}
```

- [ ] **Step 4: Run — verify passes**

```bash
pnpm test:run tests/unit/tldraw-to-shapes.test.ts
```

Expected: PASS.

- [ ] **Step 5: Create `src/components/tldraw-canvas.tsx`**

```tsx
"use client";
import { Tldraw, Editor } from "@tldraw/tldraw";
import "@tldraw/tldraw/tldraw.css";
import { useCallback } from "react";
import { convertTldrawSnapshotToShapes } from "@/lib/tldraw-to-shapes";
import { useProject } from "@/contexts/project-context";

export function TldrawCanvas() {
  const { setCanvasShapes } = useProject();

  const onMount = useCallback((editor: Editor) => {
    const sync = () => {
      const snapshot = editor.store.getSnapshot();
      setCanvasShapes(convertTldrawSnapshotToShapes({ store: snapshot.store as any }));
    };
    sync();
    return editor.store.listen(() => sync(), { scope: "document", source: "user" });
  }, [setCanvasShapes]);

  return (
    <div className="h-full w-full border-2 border-bauhaus-black bg-white">
      <Tldraw onMount={onMount} />
    </div>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/tldraw-to-shapes.ts src/components/tldraw-canvas.tsx tests/unit/tldraw-to-shapes.test.ts
git commit -m "feat: tldraw canvas component syncing shapes to project context"
```

---

### Task 25: PhotoDropzone with client-side compression

**Files:**
- Create: `src/components/photo-dropzone.tsx`, `src/lib/image-compress.ts`
- Test: `tests/unit/image-compress.test.ts`

- [ ] **Step 1: Write failing test for compression**

Create `tests/unit/image-compress.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { shouldCompress } from "@/lib/image-compress";

describe("shouldCompress", () => {
  it("returns true for files larger than 2MB", () => {
    expect(shouldCompress(3_000_000)).toBe(true);
  });
  it("returns false for small files", () => {
    expect(shouldCompress(500_000)).toBe(false);
  });
});
```

- [ ] **Step 2: Run — verify fails**

```bash
pnpm test:run tests/unit/image-compress.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Create `src/lib/image-compress.ts`**

```ts
export const COMPRESS_THRESHOLD = 2_000_000; // 2 MB
export function shouldCompress(bytes: number): boolean {
  return bytes > COMPRESS_THRESHOLD;
}

export async function compressImage(file: File, maxDim = 1600, quality = 0.8): Promise<string> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = URL.createObjectURL(file);
  });
  const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", quality);
}

export async function fileToDataUrl(file: File): Promise<string> {
  if (shouldCompress(file.size)) return compressImage(file);
  return new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}
```

- [ ] **Step 4: Run — verify passes**

```bash
pnpm test:run tests/unit/image-compress.test.ts
```

Expected: PASS.

- [ ] **Step 5: Create `src/components/photo-dropzone.tsx`**

```tsx
"use client";
import { useState } from "react";
import { Upload } from "lucide-react";
import { fileToDataUrl } from "@/lib/image-compress";

interface Props { onPhoto: (dataUrl: string) => void }

export function PhotoDropzone({ onPhoto }: Props) {
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    const url = await fileToDataUrl(file);
    setPreview(url);
    onPhoto(url);
  };

  return (
    <div className="h-full w-full border-2 border-bauhaus-black border-dashed bg-white flex items-center justify-center p-4">
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
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/image-compress.ts src/components/photo-dropzone.tsx tests/unit/image-compress.test.ts
git commit -m "feat: PhotoDropzone with client-side compression"
```

---

### Task 26: InputPanel (tabs)

**Files:**
- Create: `src/components/input-panel.tsx`

- [ ] **Step 1: Create `src/components/input-panel.tsx`**

```tsx
"use client";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TldrawCanvas } from "@/components/tldraw-canvas";
import { PhotoDropzone } from "@/components/photo-dropzone";

export type InputMode = "canvas" | "photo";

interface Props {
  mode: InputMode;
  onModeChange: (m: InputMode) => void;
  onPhoto: (dataUrl: string | null) => void;
  canvasDirty: boolean;
}

export function InputPanel({ mode, onModeChange, onPhoto, canvasDirty }: Props) {
  return (
    <div className="h-full flex flex-col border-4 border-bauhaus-black bg-white">
      <div className="border-b-4 border-bauhaus-black p-3 flex items-center justify-between">
        <span className="bauhaus-label">Sketch</span>
        {canvasDirty && (
          <span className="text-xs font-bold uppercase bg-bauhaus-yellow px-2 py-1 border-2 border-bauhaus-black">
            Canvas changed — regenerate
          </span>
        )}
      </div>
      <Tabs value={mode} onValueChange={(v) => onModeChange(v as InputMode)} className="flex-1 flex flex-col">
        <TabsList className="rounded-none border-b-4 border-bauhaus-black bg-muted p-0 h-auto">
          <TabsTrigger value="canvas" className="rounded-none border-r-2 border-bauhaus-black font-bold uppercase tracking-wider data-[state=active]:bg-bauhaus-blue data-[state=active]:text-white">
            Canvas
          </TabsTrigger>
          <TabsTrigger value="photo" className="rounded-none font-bold uppercase tracking-wider data-[state=active]:bg-bauhaus-blue data-[state=active]:text-white">
            Upload Photo
          </TabsTrigger>
        </TabsList>
        <TabsContent value="canvas" className="flex-1 m-0">
          <TldrawCanvas />
        </TabsContent>
        <TabsContent value="photo" className="flex-1 m-0">
          <PhotoDropzone onPhoto={onPhoto} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

- [ ] **Step 2: Verify typecheck**

```bash
pnpm typecheck
```

- [ ] **Step 3: Commit**

```bash
git add src/components/input-panel.tsx
git commit -m "feat: InputPanel with Canvas/Photo tabs and dirty banner"
```

---

### Task 27: SandpackPreview

**Files:**
- Create: `src/components/sandpack-preview.tsx`, `src/lib/sandpack-files.ts`
- Test: `tests/unit/sandpack-files.test.ts`

- [ ] **Step 1: Write failing test**

Create `tests/unit/sandpack-files.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { projectToSandpackFiles } from "@/lib/sandpack-files";

describe("projectToSandpackFiles", () => {
  it("maps GeneratedFile[] to Sandpack file map with base skeleton", () => {
    const project = {
      pageName: "LoginPage",
      files: [
        { path: "app/page.tsx", contents: "export default function Page(){return <div>Hi</div>}", role: "page" as const },
        { path: "components/Form.tsx", contents: "export function Form(){return <form/>}", role: "component" as const },
      ],
    };
    const files = projectToSandpackFiles(project);
    expect(files["/App.tsx"]).toBeDefined();
    expect(files["/src/page.tsx"].code).toContain("Hi");
    expect(files["/src/components/Form.tsx"].code).toContain("<form/>");
    expect(files["/package.json"]).toBeDefined();
  });
});
```

- [ ] **Step 2: Run — verify fails**

```bash
pnpm test:run tests/unit/sandpack-files.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Create `src/lib/sandpack-files.ts`**

```ts
import type { GeneratedProject } from "@/lib/schemas";

type SandpackFiles = Record<string, { code: string }>;

const APP_WRAPPER = `
import Page from "./page";
export default function App() { return <Page />; }
`.trim();

const BASE_PKG = {
  name: "sketch2app-preview",
  main: "/App.tsx",
  dependencies: {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "lucide-react": "^0.454.0",
  },
};

export function projectToSandpackFiles(project: GeneratedProject): SandpackFiles {
  const files: SandpackFiles = {
    "/App.tsx": { code: APP_WRAPPER },
    "/package.json": { code: JSON.stringify(BASE_PKG, null, 2) },
  };
  for (const f of project.files) {
    // app/page.tsx → src/page.tsx ; components/X.tsx → src/components/X.tsx
    const sandpackPath = "/src/" + f.path.replace(/^app\//, "").replace(/^components\//, "components/");
    files[sandpackPath] = { code: f.contents };
  }
  return files;
}
```

- [ ] **Step 4: Run — verify passes**

```bash
pnpm test:run tests/unit/sandpack-files.test.ts
```

Expected: PASS.

- [ ] **Step 5: Create `src/components/sandpack-preview.tsx`**

```tsx
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
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/sandpack-files.ts src/components/sandpack-preview.tsx tests/unit/sandpack-files.test.ts
git commit -m "feat: Sandpack preview with project-to-files mapping"
```

---

### Task 28: CodeView with shiki syntax highlighting

**Files:**
- Create: `src/components/code-view.tsx`

- [ ] **Step 1: Create `src/components/code-view.tsx`**

```tsx
"use client";
import { useState } from "react";
import { Shiki } from "react-shiki";
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
        <Shiki code={current.contents} language="tsx" theme="github-light" />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify typecheck**

```bash
pnpm typecheck
```

- [ ] **Step 3: Commit**

```bash
git add src/components/code-view.tsx
git commit -m "feat: CodeView with file tree and shiki highlighting"
```

---

### Task 29: DownloadZipButton

**Files:**
- Create: `src/components/download-zip-button.tsx`, `src/lib/zip-project.ts`
- Test: `tests/unit/zip-project.test.ts`

- [ ] **Step 1: Write failing test**

Create `tests/unit/zip-project.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { buildZipBlob } from "@/lib/zip-project";
import JSZip from "jszip";

describe("buildZipBlob", () => {
  it("includes all project files with correct paths", async () => {
    const blob = await buildZipBlob({
      pageName: "LoginPage",
      files: [
        { path: "app/page.tsx", contents: "A", role: "page" },
        { path: "components/X.tsx", contents: "B", role: "component" },
      ],
    });
    const zip = await JSZip.loadAsync(blob);
    expect(zip.file("app/page.tsx")).toBeTruthy();
    expect(zip.file("components/X.tsx")).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run — verify fails**

```bash
pnpm test:run tests/unit/zip-project.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Create `src/lib/zip-project.ts`**

```ts
import JSZip from "jszip";
import type { GeneratedProject } from "@/lib/schemas";

export async function buildZipBlob(project: GeneratedProject): Promise<Blob> {
  const zip = new JSZip();
  for (const f of project.files) zip.file(f.path, f.contents);
  return zip.generateAsync({ type: "blob" });
}
```

- [ ] **Step 4: Run — verify passes**

```bash
pnpm test:run tests/unit/zip-project.test.ts
```

Expected: PASS.

- [ ] **Step 5: Create `src/components/download-zip-button.tsx`**

```tsx
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
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/zip-project.ts src/components/download-zip-button.tsx tests/unit/zip-project.test.ts
git commit -m "feat: DownloadZipButton with client-side jszip packaging"
```

---

### Task 30: ResultPanel

**Files:**
- Create: `src/components/result-panel.tsx`

- [ ] **Step 1: Create `src/components/result-panel.tsx`**

```tsx
"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SandpackPreview } from "@/components/sandpack-preview";
import { CodeView } from "@/components/code-view";
import { DownloadZipButton } from "@/components/download-zip-button";
import type { GeneratedProject } from "@/lib/schemas";

interface Props { project: GeneratedProject | null }

export function ResultPanel({ project }: Props) {
  return (
    <div className="h-full flex flex-col border-4 border-bauhaus-black bg-white">
      <div className="border-b-4 border-bauhaus-black p-3 flex items-center justify-between">
        <span className="bauhaus-label">Result</span>
        {project && <DownloadZipButton project={project} />}
      </div>
      <Tabs defaultValue="preview" className="flex-1 flex flex-col">
        <TabsList className="rounded-none border-b-4 border-bauhaus-black bg-muted p-0 h-auto">
          <TabsTrigger value="preview" className="rounded-none border-r-2 border-bauhaus-black font-bold uppercase tracking-wider data-[state=active]:bg-bauhaus-red data-[state=active]:text-white">
            Preview
          </TabsTrigger>
          <TabsTrigger value="code" className="rounded-none font-bold uppercase tracking-wider data-[state=active]:bg-bauhaus-red data-[state=active]:text-white">
            Code
          </TabsTrigger>
        </TabsList>
        <TabsContent value="preview" className="flex-1 m-0">
          <SandpackPreview project={project} />
        </TabsContent>
        <TabsContent value="code" className="flex-1 m-0 overflow-hidden">
          {project ? <CodeView project={project} /> : (
            <div className="h-full flex items-center justify-center"><p className="bauhaus-label opacity-60">No code yet</p></div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/result-panel.tsx
git commit -m "feat: ResultPanel with Preview/Code tabs"
```

---

### Task 31: ChatPanel + GenerateButton

**Files:**
- Create: `src/components/chat-panel.tsx`
- Modify: none (uses existing contexts)

- [ ] **Step 1: Create `src/components/chat-panel.tsx`**

```tsx
"use client";
import { useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useApiKey } from "@/contexts/api-key-context";
import { useModel } from "@/contexts/model-context";
import { useProject } from "@/contexts/project-context";
import { runCodegen } from "@/lib/pipeline/codegen";
import { runIteration } from "@/lib/pipeline/iterate";
import { normalizePhotoToShapes } from "@/lib/pipeline/vision";
import type { InputMode } from "@/components/input-panel";

interface Props {
  mode: InputMode;
  photoDataUrl: string | null;
  onOpenKeyDialog: () => void;
  onGenerated: () => void;
}

export function ChatPanel({ mode, photoDataUrl, onOpenKeyDialog, onGenerated }: Props) {
  const { apiKey } = useApiKey();
  const { model } = useModel();
  const { project, setProject, canvasShapes, chatHistory, appendChatMessage, canvasDirty, markCanvasClean } = useProject();
  const [instruction, setInstruction] = useState("");
  const [busy, setBusy] = useState(false);

  const canGenerate = !busy && !!apiKey && (
    (mode === "canvas" && canvasShapes.length > 0) ||
    (mode === "photo" && !!photoDataUrl && model.supportsVision)
  );

  const runGenerate = async () => {
    if (!apiKey) { onOpenKeyDialog(); return; }
    setBusy(true);
    try {
      let shapes = canvasShapes;
      if (mode === "photo" && photoDataUrl) {
        shapes = await normalizePhotoToShapes({ imageDataUrl: photoDataUrl, apiKey, model: model.id });
      }
      const result = await runCodegen({ shapes, apiKey, model: model.id });
      setProject(result);
      markCanvasClean();
      onGenerated();
      toast.success("Generated!");
    } catch (e: any) {
      if (e?.status === 401) { toast.error("OpenRouter rejected your key."); onOpenKeyDialog(); }
      else if (e?.status === 402) { toast.error("Out of OpenRouter credits — top up at openrouter.ai/credits"); }
      else if (e?.status === 429) { toast.error("Rate limited — wait a moment."); }
      else { toast.error(e?.message ?? "Generation failed"); }
    } finally { setBusy(false); }
  };

  const runIterate = async () => {
    if (!apiKey) { onOpenKeyDialog(); return; }
    if (!project) return;
    if (!instruction.trim()) return;
    setBusy(true);
    appendChatMessage({ role: "user", content: instruction });
    try {
      const result = await runIteration({
        instruction, currentProject: project, canvasShapes,
        apiKey, model: model.id,
      });
      setProject(result);
      appendChatMessage({ role: "assistant", content: `Updated ${result.pageName}.` });
      setInstruction("");
    } catch (e: any) {
      toast.error(e?.message ?? "Iteration failed");
    } finally { setBusy(false); }
  };

  return (
    <div className="h-full flex flex-col border-4 border-bauhaus-black bg-white">
      <div className="border-b-4 border-bauhaus-black p-3 flex items-center justify-between">
        <span className="bauhaus-label">Refine</span>
        <Button onClick={runGenerate} disabled={!canGenerate} size="sm">
          <Sparkles className="w-4 h-4 mr-2" strokeWidth={3} />
          {project ? "Regenerate" : "Generate"}
        </Button>
      </div>
      <div className="flex-1 overflow-auto p-3 space-y-2 text-sm">
        {chatHistory.map((m, i) => (
          <div key={i} className={`border-2 border-bauhaus-black p-2 max-w-[90%] ${m.role === "user" ? "bg-bauhaus-blue/10 ml-auto" : "bg-muted"}`}>
            <span className="bauhaus-label block mb-1">{m.role}</span>
            <span className="font-medium">{m.content}</span>
          </div>
        ))}
        {chatHistory.length === 0 && project && (
          <p className="text-xs opacity-60 font-medium">Type a refinement below ("make the header red") and press ⌘↵.</p>
        )}
      </div>
      <div className="border-t-4 border-bauhaus-black p-3 flex gap-2">
        <Textarea
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); runIterate(); }
          }}
          placeholder={project ? "Describe a change…" : "Generate first to start refining"}
          disabled={!project || busy}
          className="border-2 border-bauhaus-black rounded-none resize-none h-16"
        />
        <Button variant="secondary" size="icon" disabled={!project || !instruction.trim() || busy} onClick={runIterate}>
          <Send className="w-4 h-4" strokeWidth={3} />
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify typecheck**

```bash
pnpm typecheck
```

- [ ] **Step 3: Commit**

```bash
git add src/components/chat-panel.tsx
git commit -m "feat: ChatPanel wiring generate and iterate with toast errors"
```

---

### Task 32: MainLayout (two-column)

**Files:**
- Create: `src/components/main-layout.tsx`

- [ ] **Step 1: Create `src/components/main-layout.tsx`**

```tsx
"use client";
import { useState } from "react";
import { InputPanel, type InputMode } from "@/components/input-panel";
import { ResultPanel } from "@/components/result-panel";
import { ChatPanel } from "@/components/chat-panel";
import { useProject } from "@/contexts/project-context";

interface Props { onOpenKeyDialog: () => void }

export function MainLayout({ onOpenKeyDialog }: Props) {
  const { project, canvasDirty } = useProject();
  const [mode, setMode] = useState<InputMode>("canvas");
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);

  return (
    <main className="h-[calc(100vh-80px)] grid grid-cols-[minmax(340px,1fr)_minmax(480px,1.4fr)] gap-4 p-4 bg-background">
      <InputPanel mode={mode} onModeChange={setMode} onPhoto={setPhotoDataUrl} canvasDirty={canvasDirty} />
      <div className="grid grid-rows-[1fr_280px] gap-4 min-h-0">
        <ResultPanel project={project} />
        <ChatPanel mode={mode} photoDataUrl={photoDataUrl} onOpenKeyDialog={onOpenKeyDialog} onGenerated={() => {}} />
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/main-layout.tsx
git commit -m "feat: MainLayout two-column with result+chat right column"
```

---

### Task 33: Header + root page wiring

**Files:**
- Create: `src/components/header.tsx`
- Replace: `src/app/page.tsx`, `src/app/layout.tsx` (add providers)

- [ ] **Step 1: Create `src/components/header.tsx`**

```tsx
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
```

- [ ] **Step 2: Replace `src/app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { ApiKeyProvider } from "@/contexts/api-key-context";
import { ModelProvider } from "@/contexts/model-context";
import { ProjectProvider } from "@/contexts/project-context";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], weight: ["400", "500", "700", "900"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "Sketch2App",
  description: "Hand-drawn or digital wireframes into production React code.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={outfit.variable}>
      <body className="font-sans antialiased bg-background text-foreground">
        <ApiKeyProvider>
          <ModelProvider>
            <ProjectProvider>
              {children}
              <Toaster position="top-center" />
            </ProjectProvider>
          </ModelProvider>
        </ApiKeyProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Replace `src/app/page.tsx`**

```tsx
"use client";
import { useState } from "react";
import { Header } from "@/components/header";
import { MainLayout } from "@/components/main-layout";
import { ApiKeyDialog } from "@/components/api-key-dialog";

export default function Home() {
  const [keyDialogOpen, setKeyDialogOpen] = useState(false);
  return (
    <>
      <Header onOpenKeyDialog={() => setKeyDialogOpen(true)} />
      <MainLayout onOpenKeyDialog={() => setKeyDialogOpen(true)} />
      <ApiKeyDialog open={keyDialogOpen} onOpenChange={setKeyDialogOpen} />
    </>
  );
}
```

- [ ] **Step 4: Run dev server; manually verify**

```bash
pnpm dev
```

Open `http://localhost:3000`. Expected:
- Header with geometric logo, ModelPicker, Set Key button.
- Two-column layout: tldraw canvas on left, result panel on top-right, chat on bottom-right.
- Click "Set Key" → dialog opens; paste a test key; saved.
- No console errors.

Ctrl+C.

- [ ] **Step 5: Commit**

```bash
git add src/components/header.tsx src/app/layout.tsx src/app/page.tsx
git commit -m "feat: wire Header, providers, and single-page app entry"
```

---

## Phase 6 — E2E & Ship (Tasks 34–38)

### Task 34: E2E flow 1 — Canvas happy path (mocked OpenRouter)

**Files:**
- Create: `tests/e2e/canvas-happy-path.spec.ts`

- [ ] **Step 1: Write failing test**

Create `tests/e2e/canvas-happy-path.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test("user draws, sets key, generates, sees preview", async ({ page }) => {
  await page.route("**/api/openrouter", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        choices: [{ message: { content: JSON.stringify({
          pageName: "LoginPage",
          files: [
            { path: "app/page.tsx", contents: "export default function Page(){return <div>Login</div>}", role: "page" },
          ],
        })}}],
      }),
    });
  });

  await page.goto("/");
  await page.getByRole("button", { name: /set key/i }).click();
  await page.getByLabel(/openrouter api key/i).fill("sk-or-mock");
  await page.getByRole("button", { name: /save/i }).click();

  // Draw a rectangle on tldraw by clicking a tool then dragging on the canvas
  const canvas = page.locator(".tl-container");
  await canvas.waitFor();
  // tldraw doesn't accept synthetic draws easily — instead, inject a shape via its internal store:
  await page.evaluate(() => {
    const ed = (window as any).editor ?? (window as any).__TLDRAW_EDITOR__;
    if (ed) ed.createShapes([{ type: "geo", x: 50, y: 50, props: { geo: "rectangle", w: 200, h: 60, text: "LOGIN" } }]);
  });
  // Fallback: force canvas shape count > 0 by mutating the project context exposed on window if needed.

  await page.getByRole("button", { name: /^generate$/i }).click();
  await expect(page.locator("iframe")).toBeVisible({ timeout: 15000 });
});
```

**Note:** tldraw doesn't expose its editor globally by default. To make this testable, modify `TldrawCanvas` — in `onMount`, add `(window as any).__TLDRAW_EDITOR__ = editor;` (guarded by `process.env.NODE_ENV !== "production"` or always, since MVP). Update `src/components/tldraw-canvas.tsx` accordingly:

```tsx
const onMount = useCallback((editor: Editor) => {
  (window as any).__TLDRAW_EDITOR__ = editor;
  // ...existing sync logic
}, [setCanvasShapes]);
```

- [ ] **Step 2: Run — verify fails initially, then passes**

```bash
pnpm e2e tests/e2e/canvas-happy-path.spec.ts
```

Iterate until PASS. If tldraw shape injection is flaky, alternative: expose a test-only hook that seeds `canvasShapes` directly. Acceptable for MVP.

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/canvas-happy-path.spec.ts src/components/tldraw-canvas.tsx
git commit -m "test(e2e): canvas happy path with mocked OpenRouter"
```

---

### Task 35: E2E flow 2 — Photo happy path

**Files:**
- Create: `tests/e2e/photo-happy-path.spec.ts`, `tests/e2e/fixtures/sample-sketch.png` (any 100x100 png)

- [ ] **Step 1: Add a sample PNG fixture**

Create a small placeholder PNG at `tests/e2e/fixtures/sample-sketch.png`. Any valid PNG works for the test (the mock intercepts the vision call). Generate one with:

```bash
node -e "const fs=require('fs');fs.writeFileSync('tests/e2e/fixtures/sample-sketch.png', Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=','base64'))"
```

- [ ] **Step 2: Write test**

```ts
import { test, expect } from "@playwright/test";
import path from "path";

test("user uploads photo, generates, sees preview", async ({ page }) => {
  let call = 0;
  await page.route("**/api/openrouter", async (route) => {
    call += 1;
    const body = call === 1
      ? { choices: [{ message: { content: JSON.stringify({ shapes: [
          { type: "geo", id: "v1", x: 10, y: 10, w: 100, h: 40, props: { geo: "rectangle", text: "HEADER" } },
        ]})}}]}
      : { choices: [{ message: { content: JSON.stringify({
          pageName: "PhotoPage",
          files: [{ path: "app/page.tsx", contents: "export default function Page(){return <div>Photo</div>}", role: "page" }],
        })}}]};
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(body) });
  });

  await page.goto("/");
  await page.getByRole("button", { name: /set key/i }).click();
  await page.getByLabel(/openrouter api key/i).fill("sk-mock");
  await page.getByRole("button", { name: /save/i }).click();

  await page.getByRole("tab", { name: /upload photo/i }).click();
  await page.setInputFiles("input[type=file]", path.join(process.cwd(), "tests/e2e/fixtures/sample-sketch.png"));
  await page.getByRole("button", { name: /^generate$/i }).click();
  await expect(page.locator("iframe")).toBeVisible({ timeout: 15000 });
});
```

- [ ] **Step 3: Run — verify passes**

```bash
pnpm e2e tests/e2e/photo-happy-path.spec.ts
```

- [ ] **Step 4: Commit**

```bash
git add tests/e2e/photo-happy-path.spec.ts tests/e2e/fixtures
git commit -m "test(e2e): photo happy path with mocked vision+codegen"
```

---

### Task 36: E2E flow 3 — Iteration

**Files:**
- Create: `tests/e2e/iteration.spec.ts`

- [ ] **Step 1: Write test**

```ts
import { test, expect } from "@playwright/test";

test("user generates then iterates with chat", async ({ page }) => {
  let call = 0;
  await page.route("**/api/openrouter", async (route) => {
    call += 1;
    const body = {
      choices: [{ message: { content: JSON.stringify({
        pageName: call === 1 ? "V1" : "V2",
        files: [{ path: "app/page.tsx", contents: `export default function Page(){return <div>V${call}</div>}`, role: "page" }],
      })}}]
    };
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(body) });
  });

  await page.goto("/");
  await page.getByRole("button", { name: /set key/i }).click();
  await page.getByLabel(/openrouter api key/i).fill("sk-mock");
  await page.getByRole("button", { name: /save/i }).click();

  await page.evaluate(() => {
    const ed = (window as any).__TLDRAW_EDITOR__;
    ed?.createShapes([{ type: "geo", x: 50, y: 50, props: { geo: "rectangle", w: 100, h: 40, text: "x" } }]);
  });

  await page.getByRole("button", { name: /^generate$/i }).click();
  await expect(page.locator("iframe")).toBeVisible({ timeout: 15000 });

  await page.getByPlaceholder(/describe a change/i).fill("make it red");
  await page.keyboard.press("Control+Enter");
  await expect(page.getByText(/updated v2/i)).toBeVisible({ timeout: 15000 });
});
```

- [ ] **Step 2: Run — verify passes**

```bash
pnpm e2e tests/e2e/iteration.spec.ts
```

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/iteration.spec.ts
git commit -m "test(e2e): iteration flow with two sequential mocked responses"
```

---

### Task 37: GitHub Actions CI

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Create workflow**

```yaml
name: CI
on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: 'pnpm' }
      - run: pnpm install --frozen-lockfile
      - run: pnpm typecheck
      - run: pnpm lint:strict
      - run: pnpm test:run
      - run: pnpm exec playwright install --with-deps chromium
      - run: pnpm e2e
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: typecheck + lint + vitest + playwright on PR and main"
```

---

### Task 38: Manual pre-launch checklist + Vercel deploy

**Files:**
- Modify: `MEMORY.md` (log ship milestone)

- [ ] **Step 1: Run full local checklist**

For each item, execute and check:

- [ ] Simple login form sketch on tldraw → generate with Claude Sonnet 4.6 → code compiles and preview renders.
- [ ] Same sketch → switch model to GPT-4o → regenerate → compiles and renders.
- [ ] Same sketch → switch model to Gemini 2.0 Flash → regenerate → compiles and renders.
- [ ] Upload 3 different real photos of hand-drawn wireframes → all produce reasonable output.
- [ ] Iterate 5 times on one generation ("make header smaller", "change primary color to blue", etc.) → preview updates each time.
- [ ] Enter invalid API key → error toast, dialog reopens, no crash.
- [ ] Zero-shape canvas → Generate button is disabled with tooltip.
- [ ] 50-shape canvas (hand-draw many shapes) → warning banner, generate still works.
- [ ] Click Zip → file downloads → unzip → drop into a fresh Next.js project (`pnpm create next-app test-target`) → files resolve, `pnpm dev` renders.
- [ ] Test on Firefox and Safari: all three E2E flows work manually.

- [ ] **Step 2: Push to GitHub (create remote now if not already)**

```bash
gh repo create Sketch2App --public --source=. --remote=origin --push
```

(If `gh` is unavailable, create the repo via the web UI and `git remote add origin <url> && git push -u origin main`.)

- [ ] **Step 3: Deploy to Vercel**

```bash
pnpm dlx vercel
```

Answer prompts; link to the GitHub repo; confirm build settings (Next.js auto-detected). Confirm deployed URL works.

- [ ] **Step 4: Set `NEXT_PUBLIC_APP_URL` env var in Vercel**

In Vercel project settings → Environment Variables, add `NEXT_PUBLIC_APP_URL` = deployed URL (used by the proxy for `HTTP-Referer`). Redeploy.

- [ ] **Step 5: Log ship milestone in MEMORY.md**

Prepend to "Completed Steps" in `MEMORY.md`:

```markdown
- 2026-04-XX — Sketch2App MVP shipped to Vercel. Canvas + photo inputs both working end-to-end; iterative refinement verified across Claude Sonnet, GPT-4o, Gemini; CI green.
```

- [ ] **Step 6: Final commit**

```bash
git add MEMORY.md
git commit -m "docs: log MVP ship milestone"
git push
```

---

## Appendix — File Map

Final top-level structure after plan execution:

```
Sketch2App/
├── .github/workflows/ci.yml
├── CLAUDE.md
├── MEMORY.md
├── docs/superpowers/
│   ├── specs/2026-04-14-sketch2app-design.md
│   └── plans/2026-04-14-sketch2app-mvp.md
├── playwright.config.ts
├── vitest.config.ts
├── tailwind.config.ts
├── components.json
├── package.json
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   └── api/openrouter/route.ts
│   ├── components/
│   │   ├── ui/ (shadcn primitives, Button overridden)
│   │   ├── header.tsx
│   │   ├── logo.tsx
│   │   ├── api-key-dialog.tsx
│   │   ├── model-picker.tsx
│   │   ├── tldraw-canvas.tsx
│   │   ├── photo-dropzone.tsx
│   │   ├── input-panel.tsx
│   │   ├── sandpack-preview.tsx
│   │   ├── code-view.tsx
│   │   ├── download-zip-button.tsx
│   │   ├── result-panel.tsx
│   │   ├── chat-panel.tsx
│   │   └── main-layout.tsx
│   ├── contexts/
│   │   ├── api-key-context.tsx
│   │   ├── model-context.tsx
│   │   └── project-context.tsx
│   └── lib/
│       ├── schemas.ts
│       ├── allowed-components.ts
│       ├── models.ts
│       ├── openrouter.ts
│       ├── openrouter-stream.ts
│       ├── tldraw-to-shapes.ts
│       ├── image-compress.ts
│       ├── sandpack-files.ts
│       ├── zip-project.ts
│       ├── prompts/
│       │   ├── codegen.ts
│       │   └── vision.ts
│       └── pipeline/
│           ├── codegen.ts
│           ├── vision.ts
│           └── iterate.ts
└── tests/
    ├── setup.ts
    ├── fixtures/
    │   ├── codegen-valid.json
    │   ├── codegen-invalid.json
    │   └── vision-valid.json
    ├── unit/
    │   ├── button.test.tsx
    │   ├── schemas.test.ts
    │   ├── allowed-components.test.ts
    │   ├── openrouter-route.test.ts
    │   ├── openrouter-client.test.ts
    │   ├── openrouter-stream.test.ts
    │   ├── prompts-codegen.test.ts
    │   ├── api-key-context.test.tsx
    │   ├── model-context.test.tsx
    │   ├── project-context.test.tsx
    │   ├── api-key-dialog.test.tsx
    │   ├── model-picker.test.tsx
    │   ├── tldraw-to-shapes.test.ts
    │   ├── image-compress.test.ts
    │   ├── sandpack-files.test.ts
    │   └── zip-project.test.ts
    ├── contract/
    │   ├── codegen.test.ts
    │   ├── vision.test.ts
    │   └── iterate.test.ts
    └── e2e/
        ├── smoke.spec.ts
        ├── canvas-happy-path.spec.ts
        ├── photo-happy-path.spec.ts
        ├── iteration.spec.ts
        └── fixtures/sample-sketch.png
```
