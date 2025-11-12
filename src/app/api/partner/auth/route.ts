import { type NextRequest, NextResponse } from "next/server"
import { createApiKey } from "@/lib/api-auth"

export async function POST(request: NextRequest) {
  try {
    const { partnerId, partnerName } = await request.json()

    if (!partnerId || !partnerName) {
      return NextResponse.json({ error: "Missing partnerId or partnerName" }, { status: 400 })
    }

    const apiKey = createApiKey(partnerId, partnerName)
    return NextResponse.json({
      apiKey: apiKey.key,
      partnerId: apiKey.partnerId,
      partnerName: apiKey.partnerName,
      rateLimit: apiKey.rateLimit,
    })
  } catch (error) {
    console.error("Auth error:", error)
    return NextResponse.json({ error: "Failed to generate API key" }, { status: 500 })
  }
}
