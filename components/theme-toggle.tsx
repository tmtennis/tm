"use client"
import { Moon, Sun, TurtleIcon as TennisBall } from "lucide-react"
import { useTheme } from "next-themes"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleThemeChange = (newTheme: string) => {
    if (newTheme === theme) return

    setIsAnimating(true)

    // Create theme switch overlay
    const overlay = document.createElement("div")
    overlay.className = "theme-switch-overlay"
    document.body.appendChild(overlay)

    // Change theme after a brief delay for smooth transition
    setTimeout(() => {
      setTheme(newTheme)
    }, 100)

    // Remove overlay after animation
    setTimeout(() => {
      document.body.removeChild(overlay)
      setIsAnimating(false)
    }, 600)
  }

  if (!mounted) {
    return (
      <div className="flex items-center gap-1 rounded-full border bg-background/50 p-1">
        <div className="h-8 w-8 rounded-full" />
        <div className="h-8 w-8 rounded-full" />
        <div className="h-8 w-8 rounded-full" />
      </div>
    )
  }

  const themes = [
    { name: "light", icon: Sun, label: "Light mode" },
    { name: "dark", icon: Moon, label: "Dark mode" },
    { name: "tennis", icon: TennisBall, label: "Tennis mode" },
  ]

  return (
    <div className="flex items-center gap-1 rounded-full border border-border bg-background/50 p-1 theme-transition-bg theme-transition-border">
      {themes.map(({ name, icon: Icon, label }) => (
        <motion.div key={name} className="relative">
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 rounded-full relative overflow-hidden theme-transition-fast ${
              theme === name
                ? "bg-primary text-primary-foreground shadow-sm"
                : "hover:bg-muted text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => handleThemeChange(name)}
            disabled={isAnimating}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={theme === name ? "active" : "inactive"}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Icon className="h-4 w-4" />
              </motion.div>
            </AnimatePresence>
            <span className="sr-only">{label}</span>
          </Button>

          {/* Active indicator */}
          {theme === name && (
            <motion.div
              layoutId="activeTheme"
              className="absolute inset-0 rounded-full border-2 border-primary/50"
              initial={false}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
        </motion.div>
      ))}
    </div>
  )
}
