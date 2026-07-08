"use client"

import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@wrksz/themes/client"

export const Toggletheme = () => {
  const { theme, setTheme, resolvedTheme } = useTheme()

  const switchTheme = () => {
    if (theme === "system")
      setTheme(resolvedTheme === "dark" ? "light" : "dark")

    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <Button
      onClick={switchTheme}
      variant="outline"
      size="icon"
      title="Toggle theme"
      aria-label="Toggle theme"
    >
      {resolvedTheme === "dark" ? (
        <Sun className="h-3.5 w-3.5 text-foreground" />
      ) : (
        <Moon className="h-3.5 w-3.5 text-foreground" />
      )}
    </Button>
  )
}
