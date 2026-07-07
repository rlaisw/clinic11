# Data Model: Theme Mode Native Select

**Feature**: 001-theme-mode-native-select
**Date**: 2026-07-07

This feature is a pure front-end UI change. There is no new database schema, API, or persisted record beyond the existing theme preference. The "data model" is the theme-mode state already owned by `theme-context.tsx`.

---

## Entities

### ThemeMode (enum / union)

The set of supported appearance modes. Value strings double as the CSS class applied to `<html>` and as the `<NativeSelectOption value>`.

| Attribute | Type | Allowed values | Source |
|-----------|------|----------------|--------|
| `id` (value) | string | `dark`, `light`, `light-blue`, `light-green` | `theme-context.tsx` |
| `label` (display) | string | `Dark`, `White`, `Blue`, `Green` | this feature (mapping R3) |

**Relationships**: Each `ThemeMode` maps 1:1 to a CSS class on `document.documentElement` and to CSS variables defined in `apps/web/app/globals.css`.

### ThemePreference (user state)

The user's currently selected theme, restored on load.

| Attribute | Type | Storage | Notes |
|-----------|------|---------|-------|
| `theme` | ThemeMode | `localStorage['theme']` + `?theme=` URL param | existing `ThemeProvider` logic |
| `default` | ThemeMode | `light` ("White") | applied when no stored value |

**Validation rules** (from `theme-context.tsx`):
- Only the four allowed values are accepted; any other value falls back to `light`.
- URL param takes precedence over localStorage; localStorage takes precedence over default.

---

## State Transitions

```text
[load]
  -> read URL param ?theme  -> if valid: apply
  -> else read localStorage -> if valid: apply
  -> else default (light / "White")

[user selects option in NativeSelect]
  -> setTheme(value)
  -> apply <html> class
  -> write localStorage['theme']

[reload]
  -> repeats [load] -> selected theme persists (FR-006 / SC-002)
```

The NativeSelect `value` is bound to the current `theme`, so it always reflects the active mode (FR-005).
