# Sketch2App — Design Spec

**Date:** 2026-04-14
**Status:** Draft — pending user review
**Next step:** `superpowers:writing-plans` to produce implementation plan

---

## 1. Product Summary

Sketch2App converts hand-drawn or digitally-sketched wireframes into production-quality React page code. A user either draws a wireframe inside an embedded tldraw canvas or uploads a photo of a paper/whiteboard sketch. The system generates a decomposed Next.js page — one page file plus well-named sub-components — using shadcn/ui, Tailwind CSS, and TypeScript. A live preview renders the result in an isolated sandbox, and a chat input supports iterative refinement ("make the header smaller", "change the primary color to blue"). The user downloads a zip of the generated files or copies them individually.

**Target user:** React developers who want a starting point from a rough sketch, faster than scaffolding by hand.

---

## 2. MVP Scope (and Non-Goals)

### In scope

- Two input methods: embedded tldraw canvas and photo upload.
- Output: one decomposed Next.js page per generation (page file + sub-component `.tsx` files).
- Styling stack: Tailwind CSS + shadcn/ui + TypeScript.
- Live preview using Sandpack (`@codesandbox/sandpack-react`).
- Chat-based iterative refinement on the current project.
- Model selection from any OpenRouter-supported model, with vision-capable models required for the photo input path.
- Bring-Your-Own-Key (BYOK) authentication: user's OpenRouter key stored in `localStorage`, never persisted server-side.
- Copy-individual-file and download-as-zip delivery.
- Anonymous, single-session use. No accounts, no database, no persistence across refreshes.

### Explicit non-goals (MVP)

- Authentication / user accounts.
- Billing, quotas, payments.
- Multi-page app generation.
- Server-side project persistence or history.
- Export-to-GitHub.
- Collaboration or sharing.
- Offline mode.
- Concurrent generations.
- Multi-step undo/redo across many generations (only "revert to previous" is supported).
- Visual regression tests or automated model-quality assertions.

---

## 3. Architecture

### Topology

- Next.js 15 App Router application deployed to Vercel.
- Almost entirely client-side. One API route — `/api/openrouter` — acting as a thin, stateless proxy.
- No database. No server-side AI calls. No user data stored anywhere.
- Sandpack runs the generated React code in a sandboxed iframe in the user's browser.

### Proxy responsibilities

The `/api/openrouter` route forwards requests to `https://openrouter.ai/api/v1/chat/completions`. Its job is narrowly scoped:

1. Forward the user-supplied `Authorization: Bearer <key>` header.
2. Add required OpenRouter headers (`HTTP-Referer`, `X-Title`) server-side.
3. Strip sensitive headers from any log output.
4. Stream the response back unchanged.

It never stores or inspects the key, never caches responses, and holds no state between requests.

### Security boundary

Sandpack executes generated code in an iframe sandboxed with `allow-scripts` (no `allow-same-origin`, no `allow-top-navigation`). This prevents AI-generated code — even if malicious or accidentally unsafe — from reading the BYOK key in the parent window's `localStorage` or navigating the parent page.

---

## 4. Core Data Model

A single internal representation, `CanvasShape[]`, is the common currency of the pipeline. Both input paths produce it; the code-gen step consumes it.

```typescript
type CanvasShape =
  | { type: 'geo';   id: string; x: number; y: number; w: number; h: number;
      props: { geo: 'rectangle' | 'ellipse' | 'diamond' | 'triangle' | 'pentagon' | 'hexagon' | 'star' | 'oval'; text?: string } }
  | { type: 'text';  id: string; x: number; y: number;
      props: { text: string; size: 's' | 'm' | 'l' | 'xl' } }
  | { type: 'arrow'; id: string;
      props: { start: { boundShapeId?: string }; end: { boundShapeId?: string } } }
  | { type: 'draw';  id: string;
      props: { segments: { x: number; y: number }[][] } };
```

This is a tldraw-native subset. When input is the tldraw canvas, shapes come straight from the store snapshot. When input is a photo, the vision step produces the same shape.

```typescript
type GeneratedProject = {
  pageName: string;           // PascalCase, e.g. "LoginPage"
  files: GeneratedFile[];     // one 'page' file plus zero or more 'component' files
};

type GeneratedFile = {
  path: string;               // "app/page.tsx" or "components/LoginForm.tsx"
  contents: string;           // TSX source
  role: 'page' | 'component';
};
```

All structures are validated with Zod before entering application state.

---

## 5. Pipelines

### 5.1 Canvas input → code (fast path)

```
tldraw snapshot (CanvasShape[])
    → codegen OpenRouter call (JSON mode)
    → GeneratedProject
```

The codegen prompt receives the shape list, the target styling stack (shadcn/ui allow-list), and — for iterations — the current generated files and chat history.

### 5.2 Photo input → CanvasShape[] (vision normalization)

```
image (base64 data URL, client-compressed)
    → vision OpenRouter call (JSON mode, vision-capable model required)
    → CanvasShape[]
    → joins 5.1
```

The vision prompt is narrowly scoped: "Identify each sketched element as a rectangle / ellipse / text / arrow, estimate position and size on a 1024×768 canvas, return an array of shapes. Ignore shading and noise."

The pre-flight check blocks this path when a text-only model is selected. The UI prevents the user from starting a photo generation without a vision-capable model.

### 5.3 Iteration (chat refinement)

```
{ instruction, currentProject, canvasContext, last 5 chat turns }
    → iteration OpenRouter call (streaming)
    → new GeneratedProject (full regeneration)
```

**Full regeneration, not diff patches.** LLM-generated diffs are unreliable (incorrect line numbers, silent drift). A full rewrite with prompt caching keeps cost low and output always self-consistent. The UI computes a visual diff after the fact for user display.

The canvas is frozen at last-generate. If the user edits the canvas after a generation, a "Canvas has changed — regenerate?" banner appears over the input panel; chat iteration will not pick up canvas edits until the user explicitly regenerates.

---

## 6. User Interface

### Route map

```
app/
  layout.tsx              # root layout, shadcn theme provider, toaster
  page.tsx                # single-page app (the only user-facing page)
  api/
    openrouter/route.ts   # POST handler, thin proxy
```

### Main screen (layout B — approved)

Two-column desktop layout:

- **Left column:** `<InputPanel>` — tabs for "Canvas" and "Upload photo"; contains `<TldrawCanvas>` or `<PhotoDropzone>`.
- **Right column:** `<ResultPanel>` on top with "Preview" / "Code" tabs; `<ChatPanel>` docked as a compact strip beneath it.

Preview is visually dominant (it is the "wow" surface). Chat is short-form and secondary.

### Component tree (application's own UI)

```
<App>
├── <Header>
│   ├── <ModelPicker>
│   └── <ApiKeyDialog>
├── <MainLayout>
│   ├── <InputPanel>
│   │   ├── <InputTabs>
│   │   ├── <TldrawCanvas>
│   │   └── <PhotoDropzone>
│   └── <ResultAndChat>
│       ├── <ResultPanel>
│       │   ├── <ResultTabs>
│       │   ├── <SandpackPreview>
│       │   ├── <CodeView>
│       │   └── <DownloadZipButton>
│       └── <ChatPanel>
│           ├── <ChatHistory>
│           ├── <ChatInput>
│           └── <GenerateButton>
└── <Toaster>
```

### State management

Vanilla React Context with scoped providers — no Redux, Zustand, or similar.

```
<ApiKeyProvider>    // localStorage-backed, BYOK
  <ModelProvider>   // selected OpenRouter model
    <ProjectProvider> // current GeneratedProject, chat history, canvas state
      <App />
```

Each provider exposes a small hook (`useApiKey`, `useModel`, `useProject`) with focused operations.

### Styling

The application itself uses the same shadcn/ui *primitives* it generates, but with a Bauhaus theme override (see §7a). The primitives are shared — the visual style intentionally diverges. Generated output keeps shadcn's neutral defaults so users' apps aren't forced into Bauhaus.

---

## 7. Dependencies

| Concern | Library |
|---|---|
| Framework | `next@15`, `react@19`, `typescript` |
| UI primitives | `shadcn/ui`, `tailwindcss` (heavily themed — see §7a) |
| App font | `Outfit` (Google Fonts, weights 400/500/700/900) |
| Canvas | `@tldraw/tldraw` |
| Preview sandbox | `@codesandbox/sandpack-react` |
| Syntax highlight | `shiki` via `react-shiki` |
| Zip export | `jszip` |
| Streaming parse | `eventsource-parser` |
| Validation | `zod` |
| Icons | `lucide-react` |
| Testing | `vitest`, `@testing-library/react`, `playwright` |

Explicitly excluded: Redux, Zustand, React Query, tRPC, Prisma, any ORM. The app has one API endpoint and trivial state — none of these earn their weight.

---

## 7a. Design System — Bauhaus (applies to Sketch2App's own UI only)

The Sketch2App wrapper UI — header, canvas panel chrome, chat panel, buttons, cards, dialogs — uses a **Bauhaus constructivist** aesthetic. This does not affect the React code the app generates for users: generated output remains neutral shadcn/ui defaults so users' apps match whatever their sketch implies.

### Philosophy

Form follows function, celebrating pure geometric composition. The wrapper UI is not a layout, it is a **Bauhaus poster brought to life**. Shapes overlap, borders are thick and deliberate, colors are pure primaries grounded by stark black and clean white. Every element derives from circles, squares, and triangles.

### Palette (single mode, light)

| Token | Value |
|---|---|
| `background` | `#F0F0F0` |
| `foreground` | `#121212` |
| `primary-red` | `#D02020` |
| `primary-blue` | `#1040C0` |
| `primary-yellow` | `#F0C020` |
| `border` | `#121212` |
| `muted` | `#E0E0E0` |

No dark mode for MVP. No gradients. No subtle tints.

### Typography

- **Family:** `Outfit` (Google Fonts), loaded via `next/font`. Geometric sans-serif; circular letterforms align with Bauhaus principles.
- **Weights used:** 400 (body), 500 (emphasis), 700 (subheadings/labels), 900 (display).
- **Scale (responsive):**
  - Display: `text-4xl` → `sm:text-6xl` → `lg:text-8xl`
  - Subheadings: `text-2xl` → `sm:text-3xl` → `lg:text-4xl`
  - Body: `text-base` → `sm:text-lg`
- **Rules:** Display is uppercase, `font-black`, `tracking-tighter`, `leading-[0.9]`. Body is `font-medium`, `leading-relaxed`. Labels are uppercase, `font-bold`, `tracking-widest`.

### Shape & depth

- **Radius:** binary — `rounded-none` for rectangles, `rounded-full` for circles. No values in between.
- **Borders:** always `#121212`. `border-2` on mobile, `border-4` on desktop. Section dividers use `border-b-4`.
- **Shadows:** hard offset, never blurred.
  - Small: `shadow-[4px_4px_0px_0px_black]`
  - Medium: `shadow-[6px_6px_0px_0px_black]`
  - Large: `shadow-[8px_8px_0px_0px_black]`
- **Patterns:** CSS dot grids for texture; decorative geometric shapes at 10–20% opacity for backgrounds.

### Component rules (applied to shadcn/ui primitives via theme override)

shadcn/ui primitives are themeable via CSS variables and Tailwind config. We override:

- **Buttons:**
  - Primary (red): `bg-[#D02020] text-white border-2 border-black shadow-[4px_4px_0px_0px_black]`
  - Secondary (blue): `bg-[#1040C0] text-white border-2 border-black shadow-[4px_4px_0px_0px_black]`
  - Accent (yellow): `bg-[#F0C020] text-black border-2 border-black shadow-[4px_4px_0px_0px_black]`
  - Outline: `bg-white text-black border-2 border-black shadow-[4px_4px_0px_0px_black]`
  - Shape: `rounded-none` or `rounded-full` only.
  - Active state: `active:translate-x-[2px] active:translate-y-[2px] active:shadow-none` (physical press).
  - Typography: uppercase, `font-bold`, `tracking-wider`.
- **Cards:** white background, `border-4 border-black`, `shadow-[8px_8px_0px_0px_black]`; small geometric corner decoration (8×8px circle/square/triangle in a rotating primary color); hover: `hover:-translate-y-1`.
- **Accordion (used in expandable help panels):** closed = white + border-4 + shadow; open header = `bg-[#D02020]` white text; expanded body = `bg-[#FFF9C4]`.

### Layout

- Main content container: `max-w-7xl`.
- Section padding: `py-12 px-4` → `py-16 px-6` → `py-24 px-8`.
- Section dividers: `border-b-4 border-black` throughout.
- Grid adaptations follow standard responsive breakpoints (1→2→3 or 1→2→4 columns).

### Non-generic requirements (mandatory to avoid looking like stock Tailwind)

- **Color blocking:** whole panels use solid primary backgrounds (e.g., header strip in blue, footer in near-black).
- **Geometric logo:** three shapes (circle / square / triangle) in the three primaries as the Sketch2App mark.
- **Rotated decorative elements:** deliberate 45° rotation on every 3rd repeating shape, on decorative background elements, and on any step-number badges.
- **Icon treatment:** `lucide-react` icons (stroke-width 2 or 3), placed inside bordered geometric containers — never floating naked next to text.
- **Image treatment:** any images (unlikely in MVP — maybe a sample-sketch thumbnail) use grayscale filter by default, color on hover.

### Motion

Mechanical and snappy. Durations `duration-200` or `duration-300`, `ease-out`. No soft organic easing. Button-press translate, card hover lift, accordion chevron rotation. Background patterns are static.

### What Bauhaus does *not* apply to

- The React code generated by the pipeline — generated output uses stock shadcn/ui defaults (neutral palette, standard radii, standard shadows) so users' generated apps match their own sketches.
- The Sandpack preview iframe contents — this is the user's generated code; it renders however the code specifies.
- tldraw's internal canvas chrome — tldraw controls its own visual style; we only theme the container around it.

---

## 8. Error Handling and Edge Cases

### Retry rule

At most one automatic retry per LLM step, with the prior failure context appended to the prompt. No exponential backoff. User sees a specific error within seconds if both attempts fail.

### Failure matrix

| Step | Failure | Response |
|---|---|---|
| Vision | Invalid JSON | Retry once; then error toast. |
| Vision | Zero shapes detected | Toast: "Couldn't find wireframe elements. Try a clearer photo or use the canvas." |
| Canvas | Zero shapes at generate time | Generate button disabled with tooltip: "Draw something first." |
| Vision | Text-only model selected | Pre-flight check disables generate button with tooltip. |
| Codegen | Invalid JSON / schema mismatch | Retry once; then error. |
| Codegen | Code fails to compile in Sandpack | Error overlay in preview + "retry" button that re-runs with compile error appended. |
| Codegen | Empty `files[]` | Toast: "Model produced no code. Retry." |
| Iteration | Missing page file in output | Preserve previous page file; apply only component changes. |
| OpenRouter 401 | Invalid key | Open `<ApiKeyDialog>` with "Key rejected" message. |
| OpenRouter 402 | Out of credits | Toast with link to OpenRouter billing. |
| OpenRouter 429 | Rate limited | Toast; no auto-retry. |
| OpenRouter 5xx | Transient error | Retry once after 1s; then toast. |
| Sandpack | Infinite loop detected | Sandpack watchdog overlay + "revert to previous" button. |

### Validation at boundaries

Every LLM response is validated with Zod before touching application state. Schema failures trigger the retry path — they never silently corrupt state.

### Constraints

- Soft cap: 50 shapes per canvas (warn the user).
- Hard cap: 100 shapes (block).
- Generated code is constrained to a whitelist of known shadcn/ui primitives. Hallucinated components fail validation.

### Explicit non-handling

- Offline mode: online-only, no graceful offline UX.
- Concurrent generations: UI disables the generate button while one is running.
- Mid-generation refresh: state resets; no resumption.
- Pre-scanning generated code for unsafe patterns: Sandpack sandboxing is the defense. Pattern scanning is whack-a-mole.

---

## 9. Testing Strategy

### Layers

| Layer | Tool | Scope |
|---|---|---|
| Unit | `vitest` | Pure functions in `lib/` (schemas, normalizers, zip packager) |
| Contract | `vitest` + recorded fixtures | Pipeline orchestrator against captured real OpenRouter responses |
| Component | `vitest` + `@testing-library/react` | Non-trivial UI behavior |
| E2E | `playwright` | 3 critical flows with mocked `/api/openrouter` |
| Manual | Humans + real OpenRouter | Quality — the only test that catches "the generated code is bad" |

### Contract-test pattern

Fixtures are captured in a `--record` mode during manual testing, committed to `tests/fixtures/`, and replayed via `mockFetch` in CI. This ensures tests reflect real response shapes, not invented ones. When a model changes something, fixtures can be re-recorded.

### E2E flows

1. **Canvas happy path:** draw → set key → pick model → generate → preview renders → code tab works.
2. **Photo happy path:** upload PNG → generate → preview renders.
3. **Iteration path:** after happy path, chat-iterate once → preview updates.

### Manual pre-launch checklist

Before declaring MVP shipped, a human must verify:

- [ ] Simple login form sketch → generates correctly with 3 different models (Claude Sonnet, GPT-4o, Gemini Pro).
- [ ] Three real photos of hand-drawn wireframes → all produce reasonable output.
- [ ] Five iterations on one sketch → preview updates without regressions.
- [ ] Invalid API key → clean error, no crash.
- [ ] Zero-shape canvas → blocked with helpful message.
- [ ] 50-shape canvas → warning shown, still generates.
- [ ] Downloaded zip → unzips → drops into fresh Next.js project → `npm install && npm run dev` works.
- [ ] Runs cleanly on Firefox and Safari, not only Chrome.

### CI

GitHub Actions: `typecheck` + `lint` + `vitest` + `playwright` on every PR to `main`. No automated deploys from CI for MVP; Vercel deploys are manual until the app stabilizes.

### Explicitly out of scope

- Automated model-output quality assertions.
- Visual regression (screenshot diffs).
- Tests of tldraw / Sandpack / OpenRouter internals.

---

## 10. Open Questions / Future Extensions

None blocking MVP. The following are deliberate post-MVP milestones:

1. Multi-sketch → multi-page app generation.
2. Export-to-GitHub.
3. Persistent project history (requires accounts + storage).
4. Billing + pooled-key free tier.
5. Visual diff of generated code changes during iteration.
6. Bidirectional canvas ↔ code sync (edit preview, update canvas).

Each has its own spec and plan cycle when prioritized.

---

## 11. Success Criteria for MVP Shipped

Per CLAUDE.md rule 4 (goal-driven execution), the MVP is shipped when every item on the manual pre-launch checklist (§9) passes, the three E2E flows are green in CI, unit and contract test coverage for `lib/` is at least 90%, and the app is reachable at a public Vercel URL with no known crashers.
