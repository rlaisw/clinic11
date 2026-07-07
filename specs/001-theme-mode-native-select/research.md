# Research: Theme Mode Native Select

**Feature**: 001-theme-mode-native-select
**Date**: 2026-07-07

Resolves all NEEDS CLARIFICATION from the Technical Context.

---

## R1. Which select component to use

**Decision**: Add the Shadcn/ui **Native Select** component (`NativeSelect` / `NativeSelectOption`) and use it to replace the four theme buttons.

**Rationale**:
- The user explicitly requested "Shadcn/ui - Native Select" with `<NativeSelectOption>` elements; this is a real shadcn component whose API matches the request exactly (confirmed via `ui.shadcn.com/docs/components/base/native-select`).
- A *native* select (built on the HTML `<select>` element) is keyboard- and screen-reader-accessible by default and degrades gracefully without JS, satisfying FR-007 and SC-004/SC-005.
- The existing `components/ui/select.tsx` is the Radix-based (portal) Select — not what was requested.

**Alternatives considered**:
- Keep the Radix `Select` (`select.tsx`): rejected — user explicitly asked for Native Select, and Radix Select adds portal/A11y complexity not needed here.
- Plain unstyled `<select>`: rejected — user asked for the shadcn-styled component for visual consistency with the design system.

---

## R2. How to install Native Select in this repo

**Decision**: Install via the shadcn CLI:
`npx shadcn@latest add native-select` (pnpm: `pnpm dlx shadcn@latest add native-select`).
This generates `apps/web/components/ui/native-select.tsx` importing from `@/components/ui/native-select`.

**Rationale**: Matches shadcn's documented installation and respects the project's `components.json` aliases (`ui` → `@/components/ui`).

**Fallback (if the registry/style does not serve `native-select`)**: A known upstream issue (shadcn-ui/ui #9344 / #9162) reports the registry item occasionally 404s, and this project uses the community style `base-mira` rather than `new-york`/`base`. If `add native-select` fails, manually create `apps/web/components/ui/native-select.tsx` by copying the official `base` style source from `ui.shadcn.com/docs/components/base/native-select` and adapting imports to the project's `cn()` util and `button` styles. The component must export `NativeSelect` and `NativeSelectOption`.

---

## R3. Option values vs. existing theme modes

**Decision**: The four `<NativeSelectOption>` elements use the project's existing underlying `ThemeMode` union values so `useTheme().setTheme()` works unchanged:

| Display label (user request) | `value` (ThemeMode) | Notes |
|------------------------------|---------------------|-------|
| Dark                         | `dark`              | unchanged |
| White                        | `light`             | user renamed "Light" → "White" |
| Blue                         | `light-blue`        | unchanged underlying mode |
| Green                        | `light-green`       | unchanged underlying mode |

**Rationale**: The `theme-context.tsx` `ThemeMode` type is `'dark' | 'light' | 'light-blue' | 'light-green'`, and the `<html>` classes applied are exactly those four strings. Mapping labels to existing values preserves all four themes (FR-008) with zero backend/data changes.

**Alternatives considered**: Introducing new theme value strings — rejected; would require changing `theme-context.tsx`, `globals.css` classes, and CSS variables.

---

## R4. Where the control lives

**Decision**: Replace the markup inside the existing `apps/web/components/theme-toggle.tsx` (the component rendered in `apps/web/app/(dashboard)/layout.tsx:48`, which wraps the patient-queue landing page). Keep the `useTheme()` hook usage (`theme`, `setTheme`). Leave `toggleTheme` untouched (still used by `nav-user.tsx`).

**Rationale**: Minimal blast radius — only one component file changes; the control still appears on the patient-queue landing page via the shared dashboard layout.

---

## R5. Accessibility & current-selection reflection

**Decision**:
- Pass `aria-label="Theme Mode"` (or wrap with a visually-hidden `<label>`) on `NativeSelect` so assistive tech announces "Theme Mode" (SC-005).
- Bind `value={theme}` and `onChange={(e) => setTheme(e.target.value as ThemeMode)}` so the active theme is shown as the selected option (FR-005, User Story 2).
- Native `<select>` is inherently keyboard-operable (Tab to focus, arrows + Enter to choose) → SC-004.

---

## R6. Persistence

**Decision**: Reuse the existing `ThemeProvider` persistence (localStorage key `theme` + `?theme=` URL param). No change to `theme-context.tsx` is required.

**Rationale**: FR-006 and SC-002 require persistence; the mechanism already exists and is approved.
