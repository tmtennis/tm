"use client"

import { ThemeToggle } from "@/components/theme-toggle"
import { LoginModal } from "@/components/login-modal"
import { UserDropdown } from "@/components/user-dropdown"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"
import AIChat from "@/components/ai-chat"

export default function PremiumPage() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <span className="text-2xl font-bold">
                  Tennis<span className="text-primary">Menace</span>
                </span>
              </Link>
            </div>

            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
                Daily Picks
              </Link>
              <Link href="/premium" className="text-sm font-medium text-primary">
                Premium
              </Link>
              <Link href="#" className="text-sm font-medium hover:text-primary transition-colors">
                Analysis
              </Link>
              <Link href="#" className="text-sm font-medium hover:text-primary transition-colors">
                Media Builder
              </Link>
              <Link href="#" className="text-sm font-medium hover:text-primary transition-colors">
                Contact
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <ThemeToggle />
              {user ? (
                <UserDropdown />
              ) : (
                <LoginModal>
                  <Button variant="outline" className="theme-transition bg-transparent">
                    Log In
                  </Button>
                </LoginModal>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      </main>
      <AIChat />
    </div>
  )
}
