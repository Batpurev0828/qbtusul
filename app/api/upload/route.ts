import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"

export const runtime = "nodejs"

function getBlobToken() {
  return process.env.BLOB_READ_WRITE_TOKEN || process.env.VERCEL_BLOB_READ_WRITE_TOKEN
}

function sanitizeFilename(filename: string) {
  return filename.replace(/[^a-zA-Z0-9._-]/g, "-")
}

export async function POST(request: NextRequest) {
  try {
    // Only admins can upload
    const token = request.cookies.get("gee-auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
    ]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 })
    }

    // Max 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large (max 5MB)" },
        { status: 400 }
      )
    }

    const blobToken = getBlobToken()
    if (!blobToken) {
      return NextResponse.json(
        {
          error:
            "Blob storage is not configured. Add BLOB_READ_WRITE_TOKEN (or VERCEL_BLOB_READ_WRITE_TOKEN) to environment variables.",
        },
        { status: 500 }
      )
    }

    const safeName = sanitizeFilename(file.name || "upload")
    const blob = await put(`gee-questions/${Date.now()}-${safeName}`, file, {
      access: "public",
      token: blobToken,
      addRandomSuffix: true,
      contentType: file.type || "application/octet-stream",
    })

    return NextResponse.json({
      url: blob.url,
      filename: file.name,
      size: file.size,
      type: file.type,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown upload error"
    console.error("Upload error:", error)
    return NextResponse.json(
      {
        error: "Upload failed",
        details: message,
      },
      { status: 500 }
    )
  }
}
