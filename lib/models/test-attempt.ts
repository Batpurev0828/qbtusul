import mongoose, { Schema, type Document, type Model } from "mongoose"

export interface IMCAnswerResult {
  questionIndex: number
  questionText: string
  options: string[]
  userAnswer: number
  correctAnswer: number
  isCorrect: boolean
  points: number
  earnedPoints: number
  solution: string
}

export interface IFRAnswerResult {
  questionIndex: number
  questionText: string
  userAnswer: string
  correctAnswer: string
  isCorrect: boolean
  points: number
  earnedPoints: number
  solution: string
}

export interface ITestAttempt extends Document {
  _id: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  testId: mongoose.Types.ObjectId
  mcAnswers: IMCAnswerResult[]
  frAnswers: IFRAnswerResult[]
  mcScore: number
  totalMCPoints: number
  totalFRPoints: number
  totalScore: number
  totalPossible: number
  startedAt: Date
  submittedAt: Date
}

const MCAnswerResultSchema = new Schema<IMCAnswerResult>({
  questionIndex: Number,
  questionText: String,
  options: [String],
  userAnswer: { type: Number, default: -1 },
  correctAnswer: Number,
  isCorrect: Boolean,
  points: Number,
  earnedPoints: Number,
  solution: { type: String, default: "" },
})

const FRAnswerResultSchema = new Schema<IFRAnswerResult>({
  questionIndex: Number,
  questionText: String,
  userAnswer: { type: String, default: "" },
  correctAnswer: { type: String, default: "" },
  isCorrect: { type: Boolean, default: false },
  points: Number,
  earnedPoints: { type: Number, default: 0 },
  solution: { type: String, default: "" },
})

const TestAttemptSchema = new Schema<ITestAttempt>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    testId: { type: Schema.Types.ObjectId, ref: "Test", required: true },
    mcAnswers: [MCAnswerResultSchema],
    frAnswers: [FRAnswerResultSchema],
    mcScore: { type: Number, default: 0 },
    totalMCPoints: { type: Number, default: 0 },
    totalFRPoints: { type: Number, default: 0 },
    totalScore: { type: Number, default: 0 },
    totalPossible: { type: Number, default: 0 },
    startedAt: { type: Date, required: true },
    submittedAt: { type: Date, required: true },
  },
  { timestamps: true }
)

TestAttemptSchema.index({ userId: 1, testId: 1 })
TestAttemptSchema.index({ testId: 1 })

const TestAttempt: Model<ITestAttempt> =
  mongoose.models.TestAttempt ||
  mongoose.model<ITestAttempt>("TestAttempt", TestAttemptSchema)

export default TestAttempt
