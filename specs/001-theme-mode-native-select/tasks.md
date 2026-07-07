# Tasks: Theme Mode Native Select

**Input**: Design documents from `/specs/001-theme-mode-native-select/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/, quickstart.md

**Tests**: OPTIONAL - not explicitly requested in the feature spec. One optional component test is listed in the Polish phase; everything else is implementation + manual validation via quickstart.md.

**Organization**: Tasks are grouped by user story (US1 P1, US2 P2, US3 P3) to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Exact file paths are included in descriptions

## Path Conventions

- **Web app**: `apps/web/` is the Next.js app module
- Paths are project-relative to the repo root `C:\kilocode\clinic11`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add the shadcn/ui Native Select primitive the feature depends on.

- [x] T001 Add shadcn/ui Native Select component via `npx shadcn@latest add native-select` (pnpm: `pnpm dlx shadcn@latest add native-select`) creating `apps/web/components/ui/native-select.tsx`; if the registry/style (`base-mira`) does not serve it, manually create the file by copying the official `base` style source from `ui.shadcn.com/docs/components/base/native-select` and adapting imports to the project `cn()` util (per research.md R2)
- [x] T002 Confirm `apps/web/components/ui/native-select.tsx` exports `NativeSelect` and `NativeSelectOption` and note the change-handler prop name (`onValueChange` vs native `onChange`) and whether it forwards `aria-label` to the underlying `<select>`

**Checkpoint**: Native Select primitive available and its API understood.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Confirm the integration point and the theme state contract before editing the control.

- [x] T003 Verify the theme control integration point at `apps/web/app/(dashboard)/layout.tsx:48` (renders `<ThemeToggle/>`) and confirm the `useTheme()` contract (`theme`, `setTheme`) in `apps/web/contexts/theme-context.tsx` (theme values: `dark`, `light`, `light-blue`, `light-green`)

**Checkpoint**: Foundation ready - user story implementation can begin.

---

## Phase 3: User Story 1 - Switch theme from a single dropdown (Priority: P1) 🎯 MVP

**Goal**: Replace the four theme-mode buttons with one "Theme Mode" NativeSelect offering Dark/White/Blue/Green that switches the theme immediately.

**Independent Test**: On the patient-queue landing page, open "Theme Mode", select "Blue" → page switches to the blue theme; same verified independently for Dark, White, Green (quickstart V1, V2).

### Implementation for User Story 1

- [x] T004 [US1] Rewrite `apps/web/components/theme-toggle.tsx` to render `<NativeSelect aria-label="Theme Mode">` with four `<NativeSelectOption>` elements (Dark→`dark`, White→`light`, Blue→`light-blue`, Green→`light-green`) wired to `useTheme().setTheme` (depends on T001, T003)
- [x] T005 [US1] Remove the old four-button markup and unused icon imports (`Sun`, `Moon`, `Palette`, `Monitor`, `Zap`) from `apps/web/components/theme-toggle.tsx` if they are no longer referenced in this file
- [x] T006 [US1] Ensure selecting an option applies the theme immediately (no submit) by calling `setTheme` in the change handler in `apps/web/components/theme-toggle.tsx`

**Checkpoint**: User Story 1 functional and testable independently (single dropdown switches all four themes).

---

## Phase 4: User Story 2 - Current theme reflected in the control (Priority: P2)

**Goal**: The active theme is shown as the selected option in the dropdown.

**Independent Test**: With "Blue" active, open the control → "Blue" is the selected option; after switching to "Dark", reopen → "Dark" selected (quickstart V3).

### Implementation for User Story 2

- [x] T007 [US2] Bind `value={theme}` on the `NativeSelect` in `apps/web/components/theme-toggle.tsx` so the currently active theme is displayed as the selected option (depends on T004)

**Checkpoint**: User Stories 1 AND 2 work independently.

---

## Phase 5: User Story 3 - Keyboard and assistive-technology operable (Priority: P3)

**Goal**: Control is keyboard operable and announced as "Theme Mode" by assistive tech.

**Independent Test**: Tab to the control, change theme with arrow keys + Enter; screen reader announces "Theme Mode" (quickstart V5; SC-004, SC-005).

### Implementation for User Story 3

- [x] T008 [US3] Ensure the `NativeSelect` in `apps/web/components/theme-toggle.tsx` carries the accessible name "Theme Mode" (via `aria-label` or an associated visually-hidden `<label>`) per contract `contracts/ui-theme-select.md` (depends on T004)
- [x] T009 [US3] Validate keyboard operability (native `<select>` default behavior) against quickstart V5

**Checkpoint**: All user stories independently functional.

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, validation, and quality gates affecting the whole feature.

- [x] T010 [P] Update `README.md` "Theme System" section and `TECH_STACK.md` if the new `native-select` component is worth documenting (constitution G5 action item)
- [x] T011 Run the quickstart.md validation scenarios V1-V5 in the browser and confirm all pass
- [ ] T012 [P] Optional: add a component test asserting `apps/web/components/theme-toggle.tsx` renders four `NativeSelectOption` with values `dark`, `light`, `light-blue`, `light-green` and calls `setTheme` on selection (tests/unit or project test dir)
- [x] T013 Run type-check/lint (`pnpm --filter apps/web lint` / `tsc --noEmit`) and fix any errors introduced in `apps/web/components/theme-toggle.tsx` and `apps/web/components/ui/native-select.tsx`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - start immediately (T001 adds the primitive).
- **Foundational (Phase 2)**: Depends on T001 (component must exist to verify API); blocks user-story edits.
- **User Stories (Phase 3+)**: All depend on Phase 2 completion.
  - US1 → US2 → US3 in priority order (they edit the same file sequentially; US2/US3 build on US1's markup).
- **Polish (Phase N)**: Depends on all user stories being complete.

### User Story Dependencies

- **US1 (P1)**: After Phase 2 - no dependency on other stories (core MVP).
- **US2 (P2)**: After US1 - edits the same `theme-toggle.tsx` to add `value` binding.
- **US3 (P3)**: After US1 - adds `aria-label`/accessibility to the same file.

### Within Each User Story

- Core markup (US1) before value binding (US2) before a11y label (US3).
- Story complete before moving to next priority.

### Parallel Opportunities

- T001 (add component) and T010 (doc update) touch different files and could run in parallel once T001 lands.
- T012 (optional test) is independent of story implementation and can run in parallel with Polish.
- Within a single developer flow, US1/US2/US3 must be sequential (same file), but the edits are small and incremental.

---

## Parallel Example: User Story 1

```bash
# Add the primitive (must finish before editing the control):
Task: "Add shadcn/ui Native Select component ... apps/web/components/ui/native-select.tsx"

# Then edit the control (sequential, same file):
Task: "Rewrite apps/web/components/theme-toggle.tsx to render NativeSelect ..."
Task: "Remove old four-button markup ... apps/web/components/theme-toggle.tsx"
Task: "Wire change handler to setTheme ... apps/web/components/theme-toggle.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001, T002)
2. Complete Phase 2: Foundational (T003)
3. Complete Phase 3: User Story 1 (T004, T005, T006)
4. **STOP and VALIDATE**: quickstart V1 + V2 (dropdown present, each option switches theme)
5. Demo if ready

### Incremental Delivery

1. Setup + Foundational → primitive available
2. Add US1 → test independently (V1, V2) → MVP!
3. Add US2 → test independently (V3)
4. Add US3 → test independently (V5)
5. Polish → docs + full quickstart validation + lint/type-check

### Parallel Team Strategy

With multiple developers:
1. One developer: Phase 1 + Phase 2 (adds primitive, confirms contract)
2. Same/another developer: US1 → US2 → US3 (sequential, single file)
3. Polish can be done in parallel (docs T010, optional test T012)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Tests are OPTIONAL (not requested in spec); only T012 is provided as an optional component test
- Commit after each task or logical group
- Stop at any checkpoint to validate the story independently
- All option values map to existing `ThemeMode` union (research.md R3) - no backend/context changes required
