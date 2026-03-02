"use client"

import { useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { BookOpen, Eye, EyeOff } from "lucide-react"

export default function SignupPage() {
  const { signup } = useAuth()
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Нууц үг таарахгүй байна")
      return
    }
    if (password.length < 6) {
      setError("Нууц үг хамгийн багадаа 6 тэмдэгттэй байна")
      return
    }

    setLoading(true)
    try {
      await signup(name, email, password)
      router.push("/tests")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Бүртгүүлэхэд алдаа гарлаа")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center gap-2 mb-8">
            <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground text-balance text-center">
              Бүртгэл үүсгэх
            </h1>
            <p className="text-sm text-muted-foreground">
              ЭЕШ-ийн бэлтгэлээ өнөөдрөөс эхлүүлээрэй
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-card border border-border rounded-xl p-6 flex flex-col gap-4 shadow-sm"
          >
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-sm font-medium text-foreground">
                Username
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-10 px-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Enter username here..."
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-10 px-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Enter your email here..."
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Нууц үг
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full h-10 px-3 pr-10 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Хамгийн багадаа 6 тэмдэгт"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Нууц үг нуух" : "Нууц үг харуулах"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="confirmPassword"
                className="text-sm font-medium text-foreground"
              >
                Нууц үг давтах
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="h-10 px-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Нууц үгээ дахин оруулна уу"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="h-10 bg-primary text-primary-foreground font-medium rounded-lg text-sm hover:opacity-90 transition-opacity disabled:opacity-50 mt-2"
            >
              {loading ? "Бүртгэл үүсгэж байна..." : "Бүртгэл үүсгэх"}
            </button>

            <p className="text-sm text-center text-muted-foreground mt-2">
              Бүртгэлтэй юу?{" "}
              <Link
                href="/login"
                className="text-primary font-medium hover:underline"
              >
                Нэвтрэх
              </Link>
            </p>
          </form>
        </div>
      </main>
    </div>
  )
}
