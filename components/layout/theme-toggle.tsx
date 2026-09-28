"use client";

import { Moon, Sun } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/components/providers/theme-provider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <label className="flex items-center gap-2">
      <span className="sr-only">Toggle dark mode</span>
      <Sun className="size-4 text-muted-foreground" aria-hidden="true" />
      <Switch
        checked={isDark}
        onCheckedChange={toggleTheme}
        aria-label="Toggle dark mode"
      />
      <Moon className="size-4 text-muted-foreground" aria-hidden="true" />
    </label>
  );
}
