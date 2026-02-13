import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error("MONGODB_URI environment variable is not set")
  process.exit(1)
}

async function seedAdmin() {
  try {
    await mongoose.connect(String(MONGODB_URI))
    console.log("Connected to MongoDB")

    // Dynamically import bcryptjs
    const { hash } = await import("bcryptjs")

    // Define schema inline so we don't need tsconfig paths
    const UserSchema = new mongoose.Schema(
      {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        passwordHash: { type: String, required: true },
        role: { type: String, enum: ["admin", "user"], default: "user" },
      },
      { timestamps: true }
    )

    const User = mongoose.models.User || mongoose.model("User", UserSchema)

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: "admin" })
    if (existingAdmin) {
      console.log("Admin user already exists:", existingAdmin.email)
      await mongoose.disconnect()
      return
    }

    // Create admin user
    const passwordHash = await hash("admin123", 12)
    const admin = await User.create({
      name: "Admin",
      email: "admin@gee.mn",
      passwordHash,
      role: "admin",
    })

    console.log("Admin user created successfully!")
    console.log("Email:", admin.email)
    console.log("Password: admin123")
    console.log("IMPORTANT: Change this password after first login!")

    await mongoose.disconnect()
  } catch (error) {
    console.error("Error seeding admin:", error)
    process.exit(1)
  }
}

seedAdmin()
