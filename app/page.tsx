"use client"

import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { useAuth } from "@/components/auth-provider"
import { BookOpen, Clock, CheckCircle, BarChart3 } from "lucide-react"

const features = [
  {
    icon: BookOpen,
    title: "Өмнөх оны тестүүд",
    description:
      "Өмнөх оны ЭЕШ-ийн даалгавруудыг оноор нь ангилж харж болно.",
  },
  {
    icon: Clock,
    title: "Хугацаатай дасгал",
    description:
      "Тест бүрт хугацаа тохируулж, жинхэнэ шалгалтын нөхцөлд ажиллана.",
  },
  {
    icon: CheckCircle,
    title: "Сонгох даалгаврын автомат шалгалт",
    description:
      "Сонгох даалгавар шууд дүнлэгдэж, түвшнээ дор нь мэднэ.",
  },
  {
    icon: BarChart3,
    title: "Онооны задаргаа",
    description:
      "Даалгавар тус бүрийн оноо, бодолт, тайлбарыг нэг дороос үзнэ.",
  },
]

export default function HomePage() {
  const { user, isLoading: loading } = useAuth()

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-16 sm:py-24">
        <div className="max-w-3xl mx-auto text-center flex flex-col items-center gap-6">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium">
            <BookOpen className="h-4 w-4" />
            Монгол ЭЕШ Бэлтгэлийн Платформ
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight text-balance leading-tight">
            Өмнөх оны шалгалтуудаар ЭЕШ-дээ амжилттай бэлд
          </h1>

          <p className="text-lg text-muted-foreground max-w-2xl text-pretty leading-relaxed">
            ЭЕШ-д бэлтгэх өргөн асуултын санг ашиглаж, өмнөх оны шалгалтуудаар
            бэлдэн чадвараа үнэлээрэй.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
            {!loading && !user ? (
              <>
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center h-11 px-6 bg-primary text-primary-foreground font-medium rounded-lg text-sm hover:opacity-90 transition-opacity"
                >
                  Бүртгүүлэх
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center h-11 px-6 border border-border bg-card text-foreground font-medium rounded-lg text-sm hover:bg-muted transition-colors"
                >
                  Нэвтрэх
                </Link>
              </>
            ) : !loading ? (
              <Link
                href="/tests"
                className="inline-flex items-center justify-center h-11 px-6 bg-primary text-primary-foreground font-medium rounded-lg text-sm hover:opacity-90 transition-opacity"
              >
                Тестүүд үзэх
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border bg-card px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-foreground mb-10 text-balance">
            Бэлтгэлд хэрэгтэй бүх зүйл
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="flex flex-col gap-3 p-5 rounded-xl border border-border bg-background"
              >
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-4 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-sm text-muted-foreground">
          <span>ЭЕШ Асуултын Сан</span>
          <span>Дасгал төгс төгөлдөр болгоно</span>
        </div>
      </footer>
    </div>
  )
}
