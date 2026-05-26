"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("launchpilot-theme");
    const light = saved === "light";
    document.documentElement.classList.toggle("light", light);
    document.documentElement.classList.toggle("dark", !light);
    setIsLight(light);
  }, []);

  function toggleTheme() {
    const nextLight = !isLight;
    document.documentElement.classList.toggle("light", nextLight);
    document.documentElement.classList.toggle("dark", !nextLight);
    window.localStorage.setItem("launchpilot-theme", nextLight ? "light" : "dark");
    setIsLight(nextLight);
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
      aria-label="Toggle light mode"
    >
      {isLight ? <Moon className="size-4" /> : <Sun className="size-4" />}
      {isLight ? "Dark" : "Light"}
    </button>
  );
}
