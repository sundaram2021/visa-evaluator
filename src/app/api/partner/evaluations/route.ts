import { type NextRequest, NextResponse } from "next/server"
import { getEvaluations } from "@/lib/db"
import { verifyApiKey } from "@/lib/api-auth"

export async function GET(request: NextRequest) {
  const apiKey = request.headers.get("x-api-key")
  if (!apiKey) {
    return NextResponse.json({ error: "Missing x-api-key header" }, { status: 401 })
  }

  const keyData = verifyApiKey(apiKey)
  if (!keyData) {
    return NextResponse.json({ error: "Invalid or expired API key" }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const country = searchParams.get("country")
  const minScore = searchParams.get("minScore")
  const maxScore = searchParams.get("maxScore")

  const allEvaluations = getEvaluations()

  let filtered = allEvaluations.filter((e) => e.partnerId === keyData.partnerId || !e.partnerId)

  if (country) {
    filtered = filtered.filter((e) => e.country === country)
  }

  if (minScore) {
    filtered = filtered.filter((e) => e.score >= Number.parseInt(minScore))
  }

  if (maxScore) {
    filtered = filtered.filter((e) => e.score <= Number.parseInt(maxScore))
  }

  try {
    return NextResponse.json({
      evaluations: filtered,
      total: filtered.length,
      rateLimitRemaining: keyData.rateLimit - keyData.requestsUsedToday,
    })
  } catch (error) {
    console.error("Error fetching evaluations:", error)
    return NextResponse.json({ error: "Failed to fetch evaluations" }, { status: 500 })
  }
}
