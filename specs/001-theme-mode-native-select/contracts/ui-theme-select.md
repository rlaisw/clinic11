# UI Contract: Theme Mode Native Select

**Feature**: 001-theme-mode-native-select
**Type**: Front-end component contract (no external API)

This document describes the observable behavior of the replaced theme control so that implementation and tests can be validated against it. It is not an external/system interface.

---

## Component

- **Location**: `apps/web/components/theme-toggle.tsx` (rendered in `apps/web/app/(dashboard)/layout.tsx`, visible on the patient-queue landing page).
- **Implementation**: Shadcn/ui `NativeSelect` + `NativeSelectOption` (`@/components/ui/native-select`).

## Observable Contract

| Aspect | Requirement |
|--------|-------------|
| Accessible name | Announced to assistive tech as **"Theme Mode"** (via `aria-label` or associated `<label>`). |
| Options | Exactly four: **Dark**, **White**, **Blue**, **Green**. |
| Option values | `dark`, `light`, `light-blue`, `light-green` respectively. |
| Current selection | The active theme is shown as the selected option. |
| Change behavior | Selecting an option applies the theme immediately (no submit). |
| Persistence | Selection survives page reload (localStorage + URL param). |
| Keyboard | Focusable via Tab; options choosable with arrow keys + Enter/Space. |

## Example markup (target shape)

```tsx
<NativeSelect aria-label="Theme Mode" value={theme} onValueChange={setTheme}>
  <NativeSelectOption value="dark">Dark</NativeSelectOption>
  <NativeSelectOption value="light">White</NativeSelectOption>
  <NativeSelectOption value="light-blue">Blue</NativeSelectOption>
  <NativeSelectOption value="light-green">Green</NativeSelectOption>
</NativeSelect>
```

> Note: exact prop name for the change handler depends on the installed component
> (`onValueChange` in shadcn's native-select, or native `onChange`); confirm against the
> generated `native-select.tsx` during implementation (see research R1/R2).
