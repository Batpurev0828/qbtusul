import type { Metadata, Viewport } from "next"
import "katex/dist/katex.min.css"
import { Inter, JetBrains_Mono } from "next/font/google"
import { AuthProvider } from "@/components/auth-provider"
import "./globals.css"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"


const _inter = Inter({ subsets: ["latin", "cyrillic"] })
const _jetbrainsMono = JetBrains_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ЭЕШ Асуултын Сан",
  description:
    "ЭЕШ-ийн өмнөх оны даалгавруудаар хугацаатай тест ажиллаж, бодолт болон онооны тайлангаа үзээрэй.",
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
    <html lang="mn">
      <body className="font-sans antialiased min-h-screen">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
