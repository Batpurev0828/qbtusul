import type { Metadata, Viewport } from "next"
import "katex/dist/katex.min.css"
import { Inter, JetBrains_Mono } from "next/font/google"
import { AuthProvider } from "@/components/auth-provider"
import "./globals.css"

const _inter = Inter({ subsets: ["latin", "cyrillic"] })
const _jetbrainsMono = JetBrains_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "GEE Question Bank - Mongolian Entrance Exam Practice",
  description:
    "Practice past year Mongolian General Entrance Exam (GEE) questions with timed tests, detailed solutions, and score reports.",
}

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased min-h-screen">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
