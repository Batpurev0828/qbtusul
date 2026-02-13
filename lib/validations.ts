import { z } from "zod"

export const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters").max(128),
})

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

export const mcQuestionSchema = z.object({
  questionText: z.string().default(""),
  options: z.array(z.string()).min(2).default(["", "", "", ""]),
  correctAnswer: z.number().int().min(0).default(0),
  points: z.number().min(0).default(1),
  solution: z.string().default(""),
  order: z.number().int().min(0).default(0),
})

export const frQuestionSchema = z.object({
  questionText: z.string().default(""),
  points: z.number().min(0).default(5),
  solution: z.string().default(""),
  order: z.number().int().min(0).default(0),
})

export const testSchema = z.object({
  year: z.number().int().min(1990).max(2100),
  title: z.string().min(1, "Title is required").max(200),
  subject: z.string().default("General"),
  timeLimitMinutes: z.number().int().min(1).max(600).default(120),
  mcQuestions: z.array(mcQuestionSchema).default([]),
  frQuestions: z.array(frQuestionSchema).default([]),
  published: z.boolean().default(false),
})

export type SignupInput = z.infer<typeof signupSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type TestInput = z.infer<typeof testSchema>
