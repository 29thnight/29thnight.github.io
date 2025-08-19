import { useEffect, useState } from "react"

function getInitialTheme() {
  // 저장된 값 > 시스템 설정 순서로 반영
  const saved = localStorage.getItem("theme")
  if (saved === "light" || saved === "dark") return saved
  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches
  return prefersDark ? "dark" : "light"
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem("theme", theme)
  }, [theme])

  const next = theme === "dark" ? "light" : "dark"

  return (
    <button
      className="link theme-fab"
      aria-label="Toggle theme"
      title={`Switch to ${next} mode`}
      onClick={() => setTheme(next)}
    >
      {theme === "dark" ? "🌙 Dark" : "☀️ Light"}
    </button>
  )
}
