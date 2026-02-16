"use client"

import { createContext, useContext, useCallback, type ReactNode } from "react"
import useSWR from "swr"
import { useRouter } from "next/navigation"

interface AuthUser {
  id: string
  name: string
  email: string
  role: "admin" | "user"
}

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  isAdmin: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refresh: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) return { user: null }
  return res.json()
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { data, isLoading, mutate } = useSWR("/api/auth/me", fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  })

  const user: AuthUser | null = data?.user ?? null

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Login failed")
      await mutate({ user: json.user }, false)
      router.push("/")
      router.refresh()
    },
    [mutate, router]
  )

  const signup = useCallback(
    async (name: string, email: string, password: string) => {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Signup failed")
      await mutate({ user: json.user }, false)
      router.push("/")
      router.refresh()
    },
    [mutate, router]
  )

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    await mutate({ user: null }, false)
    router.push("/")
    router.refresh()
  }, [mutate, router])

  const refresh = useCallback(() => {
    mutate()
  }, [mutate])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAdmin: user?.role === "admin",
        login,
        signup,
        logout,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
