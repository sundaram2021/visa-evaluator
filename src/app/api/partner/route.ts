import { type NextRequest, NextResponse } from "next/server"
import { getEvaluationByApiKey } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const apiKey = searchParams.get("apiKey")

    if (!apiKey) {
      return NextResponse.json(
        { error: "Unauthorized access: API key is required" },
        { status: 401 }
      )
    }

    // Verify the API key and get the associated evaluation
    const evaluation = await getEvaluationByApiKey(apiKey)

    if (!evaluation) {
      return NextResponse.json(
        { error: "Unauthorized access: Invalid API key" },
        { status: 403 }
      )
    }

    // Return the evaluation data as JSON
    const response = {
      success: true,
      data: {
        id: evaluation.id,
        name: evaluation.name || "",
        email: evaluation.email || "",
        country: evaluation.country || "",
        visaType: evaluation.visaType || "",
        score: evaluation.score || 0,
        summary: evaluation.summary || "",
        strengths: evaluation.strengths || [],
        improvements: evaluation.improvements || [],
        recommendation: evaluation.recommendation || "",
        nextSteps: evaluation.nextSteps || [],
        timeline: evaluation.timeline || "",
        additionalNotes: evaluation.additionalNotes || "",
        createdAt: evaluation.createdAt,
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error fetching evaluation:", error)
    return NextResponse.json(
      { error: "Failed to fetch evaluation data" },
      { status: 500 }
    )
  }
}
