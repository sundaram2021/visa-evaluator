import { NextResponse } from "next/server"
import { getEvaluationById } from "@/lib/db"
import { generateReportPdf } from "@/lib/report"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const evaluationId = url.searchParams.get("evaluationId")
  const format = url.searchParams.get("format") || "json"

  if (!evaluationId) return NextResponse.json({ error: "missing_evaluationId" }, { status: 400 })

  const evaluation = await getEvaluationById(evaluationId)
  if (!evaluation) return NextResponse.json({ error: "not_found" }, { status: 404 })

  // If PDF format requested, generate and return PDF
  if (format === "pdf") {
    try {
      const pdfBuffer = await generateReportPdf({
        name: evaluation.name || "Applicant",
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
        evaluationId: evaluation.id,
      })

      return new NextResponse(pdfBuffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="Evaluation-${evaluation.email}-o1.pdf"`,
        },
      })
    } catch (error) {
      console.error("Error generating PDF:", error)
      return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 })
    }
  }

  // Return JSON by default
  return NextResponse.json(evaluation)
}
