import { NextResponse } from "next/server"
import { getEvaluationById } from "@/lib/db"
import { sendEvaluationEmail } from "@/lib/email"
import { generateReportPdf } from "@/lib/report"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { evaluationId } = body
    if (!evaluationId) return NextResponse.json({ error: "missing_evaluation_id" }, { status: 400 })

    const evaluation = await getEvaluationById(evaluationId)
    if (!evaluation) return NextResponse.json({ error: "not_found" }, { status: 404 })

    const pdf = await generateReportPdf({
      name: evaluation.name,
      email: evaluation.email,
      country: evaluation.country,
      visaType: evaluation.visaType,
      score: evaluation.score,
      summary: evaluation.summary,
      strengths: evaluation.strengths,
      improvements: evaluation.improvements,
      evaluationId: evaluation.id,
    })

    await sendEvaluationEmail({
      email: evaluation.email,
      name: evaluation.name,
      country: evaluation.country,
      visaType: evaluation.visaType,
      score: evaluation.score,
      summary: evaluation.summary,
      recommendation: evaluation.recommendation,
      strengths: evaluation.strengths,
      improvements: evaluation.improvements,
      evaluationId: evaluation.id,
      attachment: { filename: `Evaluation-Report-${evaluation.id}.pdf`, content: pdf },
      userDocuments: [], // User documents not available in resend scenario
    })

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "failed" }, { status: 500 })
  }
}
