import mongoose, { Schema, type Document, type Model } from "mongoose"

export interface IMCQuestion {
  questionText: string
  options: string[]
  correctAnswer: number
  points: number
  solution: string
  order: number
}

export interface IFRQuestion {
  questionText: string
  correctAnswer: string
  points: number
  solution: string
  order: number
}

export interface ITest extends Document {
  _id: mongoose.Types.ObjectId
  year: number
  subject: string
  title: string
  timeLimitMinutes: number
  mcQuestions: IMCQuestion[]
  frQuestions: IFRQuestion[]
  published: boolean
  createdAt: Date
  updatedAt: Date
}

const MCQuestionSchema = new Schema<IMCQuestion>({
  questionText: { type: String, default: "" },
  options: [{ type: String }],
  correctAnswer: { type: Number, default: 0 },
  points: { type: Number, default: 1 },
  solution: { type: String, default: "" },
  order: { type: Number, default: 0 },
})

const FRQuestionSchema = new Schema<IFRQuestion>({
  questionText: { type: String, default: "" },
  correctAnswer: { type: String, default: "" },
  points: { type: Number, default: 5 },
  solution: { type: String, default: "" },
  order: { type: Number, default: 0 },
})

const TestSchema = new Schema<ITest>(
  {
    year: { type: Number, required: true },
    subject: { type: String, default: "General" },
    title: { type: String, required: true, trim: true },
    timeLimitMinutes: { type: Number, default: 120 },
    mcQuestions: [MCQuestionSchema],
    frQuestions: [FRQuestionSchema],
    published: { type: Boolean, default: false },
  },
  { timestamps: true }
)

TestSchema.index({ year: -1 })
TestSchema.index({ published: 1 })

const Test: Model<ITest> =
  mongoose.models.Test || mongoose.model<ITest>("Test", TestSchema)

export default Test
