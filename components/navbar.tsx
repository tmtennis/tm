"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { LoginModal } from "@/components/login-modal"
import { UserDropdown } from "@/components/user-dropdown"
import { useAuth } from "@/contexts/auth-context"

interface NavbarProps {
  logo?: string
  navLinks?: Array<{ href: string; label: string }>
  className?: string
}

export function Navbar({ 
  logo = "TennisMenace", 
  navLinks = [
    { href: "#picks", label: "Daily Picks" },
    { href: "#premium", label: "Premium" },
    { href: "#analysis", label: "Analysis" },
    { href: "#contact", label: "Contact" },
  ],
  className = ""
}: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, loading } = useAuth()

  return (
    <>
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 p-4 md:px-8 flex justify-between items-center bg-background/80 backdrop-blur-sm border-b border-border theme-transition-bg theme-transition-border ${className}`}>
        <motion.a
          href="#"
          className="text-2xl font-bold tracking-tighter theme-transition-text"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {logo.includes("Tennis") ? (
            <>
              Tennis<span className="text-primary theme-transition-text">Menace</span>
            </>
          ) : (
            logo
          )}
        </motion.a>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          {navLinks.map((link) => (
            <motion.a
              key={link.href}
              href={link.href}
              className="hover:text-foreground theme-transition-text"
              whileHover={{ y: -2 }}
              whileTap={{ y: 0 }}
            >
              {link.label}
            </motion.a>
          ))}
        </nav>
        
        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          <ThemeToggle />
          {!loading && (
            user ? (
              <UserDropdown />
            ) : (
              <LoginModal>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="outline" className="theme-transition bg-transparent">
                    Log In
                  </Button>
                </motion.div>
              </LoginModal>
            )
          )}
        </div>
        
        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
            className="theme-transition"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 left-0 right-0 z-40 bg-background border-b border-border p-4 md:hidden theme-transition-bg theme-transition-border"
          >
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-lg font-medium text-muted-foreground hover:text-foreground theme-transition-text"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              
              {/* Mobile Actions */}
              <div className="border-t border-border pt-4 flex flex-col gap-4 theme-transition-border">
                {!loading && (
                  user ? (
                    <div className="flex items-center justify-between">
                      <UserDropdown />
                      <div className="mx-4">
                        <ThemeToggle />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      <LoginModal>
                        <Button variant="outline" className="theme-transition bg-transparent">
                          Log In
                        </Button>
                      </LoginModal>
                      <div className="mx-auto">
                        <ThemeToggle />
                      </div>
                    </div>
                  )
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
