# Tasks: receipt-feature

## Phase 1: Setup

- [X] T001 Create receipt model and migrations
- [X] T002 Create receipt serializer and API endpoints
- [X] T003 Create receipt PDF generation utility
- [X] T004 Create receipt verification endpoint

## Phase 2: Backend Integration

- [X] T005 Register receipt viewset in API urls
- [X] T006 Add receipt counter model for unique reference numbers
- [X] T007 Migrate database schema
- [X] T008 Test backend endpoints with curl

## Phase 3: Frontend Implementation

- [X] T009 Create receipt React hooks (useReceipts, useCreateReceipt, etc.)
- [X] T010 Create receipt form component
- [X] T011 Create receipt detail display component
- [X] T012 Create receipt PDF modal component
- [X] T013 Create QR code display component

## Phase 4: UI Integration

- [X] T014 Add Receipt tab to layout.tsx (before Sick Leave Certificate tab)
- [X] T015 Link receipt tab to receipt page route
- [X] T016 Implement tab switching logic with currentTab state
- [X] T017 Add receipt dashboard components

## Phase 5: PDF and QR Code Generation

- [X] T018 Implement fillable PDF form population
- [X] T019 Implement QR code generation with unique tokens
- [X] T020 Add English number word conversion for total_dollars field
- [X] T021 Place QR code at left bottom of receipt template

## Phase 6: Testing

- [X] T022 Write backend tests for receipt model
- [X] T023 Write backend tests for verification endpoint
- [X] T024 Write frontend component tests
- [X] T025 Write integration tests for PDF generation
- [X] T026 Test role restrictions for doctors vs non-doctors

## Phase 7: Polish & Finalization

- [X] T027 Add validation errors for required fields
- [X] T028 Implement revocation workflow
- [X] T029 Test error boundary for PDF loading failures
- [X] T030 Final QA validation against acceptance criteria

## Dependencies

- T001 → T002 (model required before serializer)
- T002 → T003 (serializer before PDF generation)
- T003 → T004 (PDF generation before verification)
- T004 → T005 (endpoint before URL registration)
- T005 → T006 (URL registration before counter)
- T006 → T007 (counter needed before migration)
- T007 → T008 (migration needed before testing)
- T008 → T018, T019 (backend before frontend hooks)
- T018, T019 → T009, T012, T013 (after PDF generation works)
- T009 → T012 (hooks before components)
- T012 → T010, T011, T013 (components depend on hooks)
- T010, T011, T013 → T014, T015 (components before UI integration)
- T014, T015 → T016, T017, T018, T019 (UI before polish)

## Parallel Opportunities

- [P] T010, T011, T013 (form/detail/QR components can be done concurrently)
- [P] T022, T023 (backend tests)
- [P] T024, T025 (frontend/integration tests)

## Execution Strategy

**MVP Focus**: T001-T017 for core functionality (model, API, hooks, tabs, basic PDF)
**Enhancements**: T018-T019 for PDF/QR generation quality
**Testing**: T022-T025 for validation
