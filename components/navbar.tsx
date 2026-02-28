"use client"

import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { BookOpen, LogOut, Shield, User, Menu, X } from "lucide-react"
import { useState } from "react"

export function Navbar() {
  const { user, logout, isLoading: loading } = useAuth()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border w-full">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            className="flex items-center gap-2 text-primary font-bold text-lg"
          >
            <BookOpen className="h-6 w-6" />
            <span>GEE Bank</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/tests"
              className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
            >
              Tests
            </Link>
            {!loading && user ? (
              <>
                {user.role === "admin" && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
                  >
                    <Shield className="h-4 w-4" />
                    Admin
                  </Link>
                )}
                <Link
                  href="/my-attempts"
                  className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
                >
                  My Attempts
                </Link>
                <div className="flex items-center gap-3 pl-3 border-l border-border">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {user.name}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </>
            ) : !loading ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
                >
                  Sign up
                </Link>
              </div>
            ) : null}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-muted-foreground"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 flex flex-col gap-2">
            <Link
              href="/tests"
              onClick={() => setMobileOpen(false)}
              className="py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Tests
            </Link>
            {!loading && user ? (
              <>
                {user.role === "admin" && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileOpen(false)}
                    className="py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                  >
                    Admin Panel
                  </Link>
                )}
                <Link
                  href="/my-attempts"
                  onClick={() => setMobileOpen(false)}
                  className="py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  My Attempts
                </Link>
                <button
                  onClick={() => {
                    setMobileOpen(false)
                    handleLogout()
                  }}
                  className="py-2 text-left text-sm font-medium text-destructive"
                >
                  Logout
                </button>
              </>
            ) : !loading ? (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="py-2 text-sm font-medium text-primary"
                >
                  Sign up
                </Link>
              </>
            ) : null}
          </div>
        )}
      </nav>
    </header>
  )
}
