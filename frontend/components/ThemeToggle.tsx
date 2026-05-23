"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme";

interface ThemeToggleProps {
  className?: string;
  size?: "sm" | "md";
}

export default function ThemeToggle({
  className = "",
  size = "md",
}: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const iconClass = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  const btnClass =
    size === "sm" ? "h-9 w-9" : "h-10 w-10";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={
        theme === "light" ? "Switch to dark mode" : "Switch to light mode"
      }
      className={`flex ${btnClass} shrink-0 items-center justify-center rounded-full text-zoom-muted transition-colors hover:bg-zoom-border/50 hover:text-zoom-text ${className}`}
    >
      {theme === "light" ? (
        <Moon className={iconClass} />
      ) : (
        <Sun className={iconClass} />
      )}
    </button>
  );
}
