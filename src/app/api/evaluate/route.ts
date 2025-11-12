import { type NextRequest, NextResponse } from "next/server"
import { generateEvaluation } from "@/lib/evaluation-engine"
import { storeEvaluation } from "@/lib/db"
import { sendEvaluationEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Generate evaluation score and summary
    const evaluation = generateEvaluation(body)

    // Store in database
    const storedEvaluation = await storeEvaluation({
      ...body,
      ...evaluation,
      timestamp: new Date(),
    })

    await sendEvaluationEmail({
      email: body.email,
      name: body.name,
      country: body.country,
      visaType: body.visaType,
      score: evaluation.score,
      summary: evaluation.summary,
      recommendation: evaluation.recommendation,
      strengths: evaluation.strengths,
      improvements: evaluation.improvements,
      evaluationId: storedEvaluation.id,
    })

    return NextResponse.json({
      ...evaluation,
      evaluationId: storedEvaluation.id,
    })
  } catch (error) {
    console.error("Evaluation error:", error)
    return NextResponse.json({ error: "Failed to process evaluation" }, { status: 500 })
  }
}
