"use client";

import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { useTheme } from "@/contexts/theme-context";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <NativeSelect
      aria-label="Theme Mode"
      value={theme}
      onChange={(e) =>
        setTheme(e.target.value as "dark" | "light" | "light-blue" | "light-green")
      }
      className="w-36"
    >
      <NativeSelectOption value="dark">Dark</NativeSelectOption>
      <NativeSelectOption value="light">White</NativeSelectOption>
      <NativeSelectOption value="light-blue">Blue</NativeSelectOption>
      <NativeSelectOption value="light-green">Green</NativeSelectOption>
    </NativeSelect>
  );
}
