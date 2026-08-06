# Research: pdf-preview-icon

## PDF Rendering Options

### Option 1: `react-pdf` Library
- **Research**: Evaluated `react-pdf` (uses PDF.js under the hood) for rendering PDFs in the modal
- **Findings**:
  - Pros: Native PDF support, supports annotations/zoom, integrates with React
  - Cons: Large bundle size (~500KB min), requires environment setup
- **Alternative Considered**: Native `<iframe>` with `src="data:application/pdf"`
  - Pros: Smaller bundle, simpler setup
  - Cons: Limited control over rendering, no touch gestures
- **Recommendation**: Use `react-pdf` for better UX control, despite bundle size. Bundle optimization can be addressed later.

### Option 2: Native HTML5 Canvas or `<object>`
- **Research**: Tested raw `<object>` tags with `data="data:application/pdf"`
- **Findings**:
  - Pros: Works across browsers, no dependencies
  - Cons: No zoom/pan controls, poor accessibility
- **Recommendation**: Not viable for modern UX requirements

## Mobile Touch Interactions

### Pinch-to-Zoom
- **Research**: Evaluated available libraries and native implementation
- **Findings**:
  - `react-image-zoom` library supports pinch-to-zoom
  - Native Web APIs (`pinchscale` events) can be used
- **Implementation Plan**: Use `react-image-zoom` for consistency with Shadcn UI, with fallback to native APIs

### Tap-to-Close
- **Research**: Verified touch event handling in React
- **Findings**:
  - Standard `touchend`/`touchcancel` events work reliably
  - Conflict with long-press gestures on mobile
- **Implementation Plan`: Use `touchend` for close button, with timeout to prevent accidental closes

## Loading State Patterns

### Research: Existing Loading Components
- **Research**: Scanned `apps/web/components/ui/` for existing spinners
- **Findings**:
  - Found `Spinner` component in Shadcn UI
  - Matches our project's style guidelines
- **Implementation Plan`: Reuse `Spinner` component for modal loading state

## Error Boundary Handling

### Research: PDF Loading Errors
- **Research**: Examined error handling in existing components
- **Findings**:
  - Common pattern: Display error message with retry button
  - Should align with existing error boundaries in the app
- **Implementation Plan`: Create dedicated `PDFErrorBoundary` component that:
  - Shows "PDF loading failed" message
  - Offers retry button (re-fetch PDF)
  - Triggers download link if retry fails

## Summary of Resolutions

- PDF rendering: `react-pdf` recommended with bundle monitoring
- Mobile gestures: `react-image-zoom` for pinch-to-zoom + `touchend` for close
- Loading: Reuse Shadcn `Spinner`
- Errors: Dedicated error boundary component

Tasks for Phase 1:
1. Implement `react-pdf` in modal
2. Add touch gesture support using `react-image-zoom`
3. Integrate Shadcn `Spinner` for loading state
4. Create `PDFErrorBoundary` component