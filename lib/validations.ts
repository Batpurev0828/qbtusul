import { z } from "zod"

export const signupSchema = z.object({
  name: z.string().min(2, "Нэр хамгийн багадаа 2 тэмдэгттэй байна").max(100),
  email: z.string().email("Имэйл хаяг буруу байна"),
  password: z.string().min(6, "Нууц үг хамгийн багадаа 6 тэмдэгттэй байна").max(128),
})

export const loginSchema = z.object({
  email: z.string().email("Имэйл хаяг буруу байна"),
  password: z.string().min(1, "Нууц үг заавал шаардлагатай"),
})

export const mcQuestionSchema = z.object({
  questionText: z.string().default(""),
  description: z.string().default(""),
  options: z.array(z.string()).min(2).default(["", "", "", ""]),
  correctAnswer: z.number().int().min(0).default(0),
  points: z.number().min(0).default(1),
  solution: z.string().default(""),
  order: z.number().int().min(0).default(0),
})

export const frQuestionSchema = z.object({
  questionText: z.string().default(""),
  description: z.string().default(""),
  correctAnswer: z.string().default(""),
  points: z.number().min(0).default(5),
  solution: z.string().default(""),
  order: z.number().int().min(0).default(0),
})

export const testSchema = z.object({
  tag: z
    .string()
    .trim()
    .min(1, "Шошго заавал шаардлагатай")
    .max(50)
    .regex(/^[A-Za-z0-9_-]+$/, "Шошго нь зөвхөн үсэг, тоо, _ эсвэл - агуулна"),
  title: z.string().min(1, "Гарчиг заавал шаардлагатай").max(200),
  summary: z.string().default(""),
  description: z.string().default(""),
  subject: z.string().default("General"),
  timeLimitMinutes: z.number().int().min(0).max(600).default(120),
  mcQuestions: z.array(mcQuestionSchema).default([]),
  frQuestions: z.array(frQuestionSchema).default([]),
  published: z.boolean().default(false),
})

export type SignupInput = z.infer<typeof signupSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type TestInput = z.infer<typeof testSchema>
