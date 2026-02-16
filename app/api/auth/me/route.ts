import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"

export const dynamic = "force-dynamic"

const noStoreHeaders = { "Cache-Control": "no-store" }

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ user: null }, { status: 200, headers: noStoreHeaders })
    }

    return NextResponse.json(
      {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { headers: noStoreHeaders }
    )
  } catch {
    return NextResponse.json({ user: null }, { status: 200, headers: noStoreHeaders })
  }
}
