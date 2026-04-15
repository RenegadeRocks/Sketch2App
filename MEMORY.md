# Sketch2App — Project Memory

Living log of the project. Update at the end of each working session.

---

## Project Details

- **Name:** Sketch2App
- **Goal:** Convert hand-drawn or in-app wireframes into production-quality React page code (shadcn/ui + Tailwind + TS) for React developers — demo-grade MVP, BYOK OpenRouter, anonymous, no persistence.
- **Stack (as built 2026-04-14):** Next.js **16.2.3** App Router, React 19.2.4, TypeScript, **Tailwind v4** (CSS-based `@theme` — no `tailwind.config.ts`), shadcn/ui (style=`base-nova`, using `@base-ui/react` + `@radix-ui/react-slot`), `@tldraw/tldraw@^4.5.8`, `@codesandbox/sandpack-react`, zod, vitest, playwright. Package manager = **npm** (pnpm not available).
- **Repo / deploy target:** Local only (no git repo yet); target deploy = Vercel.
- **Design system (wrapper UI only):** Bauhaus constructivist — primary red/blue/yellow, Outfit font, hard offset shadows, binary radii, thick black borders. Generated output stays neutral shadcn defaults.
- **Started:** 2026-04-14

---

## Completed Steps

_Chronological log of meaningful milestones. Newest at the top. Format: `YYYY-MM-DD — short description` with a one-line "why/outcome" beneath if useful._

- 2026-04-14 — **Sandpack preview now actually renders** (confirmed via live MCP-Playwright browser session against the real `2-19-8-sandpack.codesandbox.io` bundler). Three-part fix:
  1. `src/lib/sandpack-shadcn-shims.ts` — preview-only Tailwind shims for all 12 shadcn primitive files (button, input, textarea, label, badge, separator, card, dialog, tabs, tooltip, accordion, select). Injected into `projectToSandpackFiles` via spread before project files so model-emitted files can override. ZIP download stays pure shadcn.
  2. `src/lib/sandpack-files.ts` — replaced the `/App.tsx` wrapper with an explicit `/index.tsx` entry (`createRoot(...).render(<Page/>)`) and `/public/index.html` (`<div id="root">`), and set `package.json` main to `/index.tsx`. Without this, Sandpack's `react-ts` template bundled successfully but never mounted — the iframe stayed blank with `height: 8px`.
  3. `src/components/sandpack-preview.tsx` — swapped the `<Sandpack />` preset (50/50 editor+preview split that collapsed the preview) for `SandpackProvider` + `SandpackLayout` + `SandpackPreview` so the preview tab is preview-only.
  - Live browser check: mocked `/api/openrouter` via `window.fetch` override to return a page importing `Button/Card/CardHeader/CardTitle/CardContent/Input/Label` — all rendered correctly in the sandbox.
  - Tests: 19 files / 56 vitest tests + 4 Playwright E2E specs all green.
- 2026-04-14 — **Manual smoke testing session — 3 bugs fixed, 1 open.**
  - Fixed: Sandpack path prefix (was `/src/` — APP_WRAPPER's `./page` import couldn't resolve). Changed to `/` root. `src/lib/sandpack-files.ts` + matching unit test.
  - Fixed: LLM wraps JSON in ```` ```json ```` fences → `JSON.parse` crashed with VisionError. Added `src/lib/extract-json.ts` that strips fences; wired into `src/lib/pipeline/vision.ts` and `codegen.ts`.
  - Fixed: Gemini 2.0 Flash `:free` variant returns 404 on OpenRouter. Changed `src/lib/models.ts` to `google/gemini-2.0-flash-001`.
  - Fixed: Added generating-spinner UI + yellow banner + console.log diagnostics in `src/components/chat-panel.tsx` (requests take 30–120s; user was assuming it hung).
  - Fixed: Sandpack couldn't resolve `@/` Next.js alias imports. Added `rewriteAliasImports()` in `src/lib/sandpack-files.ts` rewriting `@/x` → `/x` before handing files to Sandpack.
  - **STILL BROKEN:** Generated code imports shadcn primitives (e.g., `@/components/ui/input`, `@/components/ui/button`, `@/components/ui/card`) that are NOT present in the Sandpack sandbox. Error: `Could not find module in path: '/components/ui/input' relative to '/components/EmailInput.tsx'`. Root cause: codegen prompt (`src/lib/prompts/codegen.ts`) tells the model to use shadcn/ui but Sandpack has no shadcn installed. Two possible fixes — (a) update the prompt to use plain HTML + Tailwind and NO shadcn imports, or (b) shim the common shadcn primitives as plain Tailwind components and inject them into Sandpack's files map. Option (b) is better because it preserves the user-facing code quality in the ZIP download. See Pending.
- 2026-04-14 — **Phases 1–6 (Tasks 9–37) complete.** Full MVP implemented via subagent-driven execution. 19 unit test files / 54 vitest tests passing. 4 Playwright E2E specs passing (smoke + canvas + photo + iteration, all mocked against `/api/openrouter`). `npm run typecheck`, `npm run build`, and full E2E suite all green. Dev-server browser smoke confirmed: Header + ModelPicker + two-column MainLayout render without console errors. GitHub Actions CI workflow wired for npm. Task 38 (manual pre-launch checklist + GitHub remote + Vercel deploy) deferred — requires user-driven steps.
  - Notable adaptations during execution: (1) tldraw 4.x geo shapes use `richText`, not `text`, for `createShapes`; (2) Base UI Tabs uses `data-active:` not Radix's `data-[state=active]:`; (3) `react-shiki` exports `ShikiHighlighter` with content as children; (4) `editor.getSnapshot().document.store` instead of `editor.store.getSnapshot()` in tldraw 4.x; (5) added `exclude: ["**/tests/e2e/**"]` to `vitest.config.ts` so Playwright specs don't leak into vitest runs; (6) `(window as any).__TLDRAW_EDITOR__ = editor` hook exposed from `TldrawCanvas` for E2E shape injection.
- 2026-04-14 — **Phase 0 complete** (Tasks 1–8). Project scaffold + deps + shadcn primitives + Outfit + Bauhaus tokens + Bauhaus Button + vitest (3/3 passing) + Playwright smoke (1/1 passing). 8 git commits. `typecheck` and `npm run build` both green.
  - Stack drift from plan noted in plan's new "Stack Reality" section.
- 2026-04-14 — Implementation plan written and saved.
  - Plan location: `docs/superpowers/plans/2026-04-14-sketch2app-mvp.md`.
  - 38 TDD tasks across 6 phases: Bootstrap → Schemas → OpenRouter proxy → Codegen/Vision/Iteration → State contexts → UI components → E2E + CI + deploy.
- 2026-04-14 — Brainstorming complete; design spec written and approved.
  - Spec location: `docs/superpowers/specs/2026-04-14-sketch2app-design.md`.
  - Locked: tldraw canvas + photo upload → structured CanvasShape[] → OpenRouter codegen → shadcn/Tailwind/TS React page + sub-components → Sandpack preview + chat iteration. BYOK, demo-grade MVP, Bauhaus-themed wrapper UI.
- 2026-04-14 — Installed superpowers + UI/UX Pro Max skills; set up CLAUDE.md (behavioral rules) and MEMORY.md (this file).

---

## In Progress

_What is actively being worked on right now. Move to "Completed Steps" when done._

- Task 38 — Manual pre-launch checklist + GitHub remote + Vercel deploy. Blocked on user-driven steps (browser testing across models, `gh repo create`, `vercel` CLI prompts, env var setup).

---

## Pending

_Backlog of known next steps, ordered roughly by priority. Keep this tight — this is not an idea dump._

- **P1 — Manual browser smoke with a real OpenRouter key** to confirm end-to-end generation + preview across the 5 configured models. Live Playwright run used a mocked response; a real-model run is still needed as part of Task 38.
- Task 38 step 1: manual browser checklist — draw a login form on tldraw, try each model (Sonnet 4.6, Opus 4.6, GPT-4o, Gemini 2.0 Flash, Haiku 4.5), verify codegen + preview for each. Upload 3 real hand-drawn wireframe photos. Iterate 5 turns via chat. Invalid-key path. Zip download + drop into fresh Next app + verify it runs. Test Firefox + Safari.
- Task 38 step 2: create GitHub remote and push (`gh repo create Sketch2App --public --source=. --remote=origin --push`).
- Task 38 step 3: `npx vercel` → link to repo → confirm deploy → set `NEXT_PUBLIC_APP_URL` env var → redeploy.
- Optional: invoke `ui-ux-pro-max` to polish Bauhaus theming once live (ModelPicker shows raw model id in a hidden input — cosmetic Base UI quirk, non-blocking).

---

## Decisions & Rationale

_Non-obvious choices worth remembering later (why X over Y). Short entries._

- _(none yet)_

---

## Open Questions / Blockers

_Things unresolved or waiting on external input._

- _(none yet)_
