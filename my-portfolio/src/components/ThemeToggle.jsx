import { useEffect, useState, useRef } from "react"
import { createPortal } from "react-dom"

function getInitialTheme() {
  const saved = localStorage.getItem("theme")
  if (saved === "light" || saved === "dark") return saved
  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches
  return prefersDark ? "dark" : "light"
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const mqW = window.matchMedia("(max-width: 640px)")
    const mqP = window.matchMedia("(pointer: coarse)")
    const update = () => setIsMobile(!!(mqW.matches && mqP.matches))
    update()
    mqW.addEventListener?.("change", update)
    mqP.addEventListener?.("change", update)
    return () => {
      mqW.removeEventListener?.("change", update)
      mqP.removeEventListener?.("change", update)
    }
  }, [])
  return isMobile
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState(getInitialTheme)
  const isMobile = useIsMobile()

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem("theme", theme)
  }, [theme])

  const next = theme === "dark" ? "light" : "dark"
  const btn = (
    <button
      className="link theme-fab"
      aria-label="Toggle theme"
      title={`Switch to ${next} mode`}
      onClick={() => setTheme(next)}
    >
      {theme === "dark" ? "🌙 Dark" : "☀️ Light"}
    </button>
  )

  // ✅ 모바일에선 버튼을 body로 포털 → 네비 캡슐 밖(뷰포트 우하단)에 고정
  return isMobile ? createPortal(btn, document.body) : btn
}
