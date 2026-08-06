# Tasks: pdf-preview-icon

## Phase 1: Setup

- [X] T001 Initialize feature branch and verify environment
- [X] T002 [P] Review and confirm existing PDF endpoint functionality
- [X] T003 [P] Verify doctor permission system is properly configured

## Phase 2: Foundational Tasks

- [X] T004 Create PDF preview modal component skeleton
- [X] T005 Implement modal open/close logic with ESC key support
- [X] T006 Create useSickLeaveCertificatePreview hook
- [X] T007 Implement PDF fetching from /api/sick-leave-certificates/{id}/pdf endpoint
- [X] T008 Add loading state with Spinner component
- [X] T009 Create error boundary component for PDF loading failures

## Phase 3: User Story 1 (P1) - Preview Icon & Modal Display

- [X] T010 [US1] Add preview icon to sick leave certificate tab header
- [X] T011 [US1] Implement icon click handler to open modal
- [X] T012 [US1] Style icon according to Shadcn UI guidelines
- [X] T013 [US1] Integrate PDF rendering in modal (native iframe, no new deps)
- [X] T014 [US1] Add zoom/pan controls (CSS transform zoom)
- [X] T015 [US1] Implement pinch-to-zoom (native touch events)
- [X] T016 [US1] Add tap-to-close handler with timeout prevention
- [X] T017 [US1] Touch gesture handlers implemented for mobile
- [X] T018 [US1] Implement download link fallback in error state
- [X] T019 [US1] Modal responsive across viewports (Tailwind w-4/5 max-w-4xl)

## Phase 4: User Story 2 (P2) - Error Handling & Fallback

- [X] T020 [P2] Add download link visibility in error state
- [X] T021 [P2] Implement retry mechanism for failed PDF loads
- [X] T022 [P2] Error boundary in place for PDF failures
- [X] T023 [P2] Download link available in error state and modal

## Phase 5: Polish & Finalization

- [X] T024 Add accessibility labels for screen readers
- [X] T025 Document component usage and API
- [X] T026 TypeScript compilation passes (no new errors)
- [X] T027 No bundle size impact (no new dependencies added)
- [X] T028 Final QA validation against all acceptance criteria

## Dependencies

- T001 → T004 (setup must complete before component creation)
- T004 → T005 (modal skeleton before open/close logic)
- T005 → T006 (modal logic before hook creation)
- T006 → T007 (hook before API implementation)
- T007 → T008, T009 (API implementation before loading/error states)
- T008, T009 → T010 (loading/error states before UI integration)
- T010 → T011-T019 (UI foundation before user story tasks)

## Parallel Opportunities

- [P] T002 and T003 (environment verification)
- [P] T013 and T015 (PDF rendering and touch gestures)
- [P] T020 and T021 (error handling improvements)

## Execution Strategy

**MVP Focus**: Complete T001-T019 for core functionality (icon, modal, PDF rendering, basic touch)
**Enhancements**: T020-T028 for robustness, accessibility, and performance
**Testing**: Validate each user story independently using acceptance criteria from spec.md