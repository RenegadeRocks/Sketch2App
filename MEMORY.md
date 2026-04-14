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

- Phase 1 — Zod schemas (Tasks 9–10). Subagent-driven execution, continuing from Phase 0.

---

## Pending

_Backlog of known next steps, ordered roughly by priority. Keep this tight — this is not an idea dump._

- Execute remaining 30 tasks (Phases 1–6).
- Optional: add a GitHub remote (local git initialized; no remote yet).
- Invoke `ui-ux-pro-max` during Phase 5 (UI components) to validate Bauhaus theming.

---

## Decisions & Rationale

_Non-obvious choices worth remembering later (why X over Y). Short entries._

- _(none yet)_

---

## Open Questions / Blockers

_Things unresolved or waiting on external input._

- _(none yet)_
