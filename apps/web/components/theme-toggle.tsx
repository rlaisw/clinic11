"use client";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/theme-context";
import { Sun, Moon, Palette, Monitor, Zap } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme, toggleTheme } = useTheme();

  const themes = [
    { id: "dark" as const, label: "Dark", icon: Moon, color: "text-gray-400" },
    { id: "light" as const, label: "Light", icon: Sun, color: "text-yellow-400" },
    { id: "light-blue" as const, label: "Blue", icon: Monitor, color: "text-blue-400" },
    { id: "light-green" as const, label: "Green", icon: Zap, color: "text-green-400" },
  ];

  return (
    <div className="flex items-center gap-2 p-2">
      {themes.map((t) => (
        <Button
          key={t.id}
          variant={theme === t.id ? "default" : "outline"}
          size="icon"
          onClick={() => setTheme(t.id)}
          className={`rounded-full ${t.color} hover:scale-105 transition-transform`}
          aria-label={`Switch to ${t.label} mode`}
          title={`${t.label} Mode`}
        >
          <t.icon className="h-4 w-4" />
        </Button>
      ))}
    </div>
  );
}