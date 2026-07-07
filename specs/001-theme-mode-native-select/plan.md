# Implementation Plan: Theme Mode Native Select

**Branch**: `001-theme-mode-native-select` | **Date**: 2026-07-07 | **Spec**: [spec.md](./spec.md)

**Status**: Implemented — `native-select.tsx` added via shadcn CLI; `theme-toggle.tsx` rewritten to use the Native Select; README/TECH_STACK updated. Type-check passes for changed files.

**Input**: Feature specification from `/specs/001-theme-mode-native-select/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Replace the four separate theme-mode buttons (`ThemeToggle`, rendered via `apps/web/app/(dashboard)/layout.tsx:48` on the patient-queue landing page) with a single Shadcn/ui **Native Select** control titled **"Theme Mode"**, offering four options — **Dark, White, Blue, Green** — that map to the existing underlying themes (`dark`, `light`, `light-blue`, `light-green`). Selecting an option applies the theme immediately and persists via the existing `theme-context` mechanism. Research: [research.md](./research.md).

## Technical Context

**Language/Version**: TypeScript (strict), React 19.2.0, Next.js 16.2.0 (App Router, RSC)

**Primary Dependencies**: shadcn/ui (style `base-mira`), Tailwind CSS 3.4.19, Radix UI primitives, `lucide-react` icons

**Storage**: N/A (no new data store; theme preference reused via `localStorage['theme']` + `?theme=` URL param in `theme-context.tsx`)

**Testing**: Jest (per `TECH_STACK.md`); manual browser validation per [quickstart.md](./quickstart.md)

**Target Platform**: Web (browser); dev on Windows 11, production Linux

**Project Type**: web-service / front-end (Next.js app within Turborepo monorepo)

**Performance Goals**: Theme switch applies visually without noticeable delay (<1s perceived); no layout shift

**Constraints**: Must not introduce new frameworks/libraries beyond the already-approved shadcn/ui stack (constitution: Frozen Stack). Must preserve all four existing themes and persistence.

**Scale/Scope**: Single component change (`theme-toggle.tsx`) + add one shadcn UI primitive (`native-select.tsx`). No backend/database change.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Requirement (from `.speckit.constitution`) | Status | Notes |
|------|--------------------------------------------|--------|-------|
| G1 | No new frameworks/libraries without explicit human approval | PASS | `native-select` is part of the already-approved shadcn/ui library, added via its CLI. No new dependency. |
| G2 | Follow existing folder structure and naming conventions | PASS | New primitive goes in `apps/web/components/ui/`; feature edit in existing `components/theme-toggle.tsx`. |
| G3 | Extend rather than replace existing code | PASS | `theme-toggle.tsx` is extended (markup swapped) reusing `useTheme()`; `theme-context.tsx` unchanged. |
| G4 | Respect module boundaries | PASS | Only the front-end `apps/web` module touched; no cross-module changes. |
| G5 | Documentation updated for changes | ACTION | If the new `native-select` component is worth noting, update `README.md` "Theme System" section and `TECH_STACK.md`. |

No gate violations require justification. **Post-design re-check**: still PASS — design extends existing patterns, adds no framework, keeps all four themes and persistence.

## Project Structure

### Documentation (this feature)

```text
specs/001-theme-mode-native-select/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── ui-theme-select.md
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
apps/web/
├── components/
│   ├── ui/
│   │   └── native-select.tsx        # NEW: added via shadcn CLI (fallback: manual copy)
│   └── theme-toggle.tsx             # MODIFIED: four buttons -> NativeSelect
├── contexts/
│   └── theme-context.tsx            # UNCHANGED (reused; provides theme/setTheme)
└── app/
    └── (dashboard)/
        └── layout.tsx               # UNCHANGED (renders <ThemeToggle/> at :48)
```

**Structure Decision**: Front-end-only change within the existing Next.js `apps/web` app (Option 2 "Web application" structure, narrowed to the relevant files). No backend or shared-package changes.

## Complexity Tracking

> No constitution violations to justify. Left empty.
