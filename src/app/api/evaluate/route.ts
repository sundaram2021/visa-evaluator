import { type NextRequest, NextResponse } from "next/server"
import { generateEvaluation } from "@/lib/evaluation-engine"
import { storeEvaluation } from "@/lib/db"
import { sendEvaluationEmail } from "@/lib/email"
import { validateDocumentsWithAgent } from "@/lib/evaluation-agent"
import { generateReportPdf } from "@/lib/report"
import { createJob, removeJob } from "@/lib/job-manager"

export async function POST(request: NextRequest) {
  try {
    // Expect FormData with `payload` JSON and files under `files`
    const formData = await request.formData()
    const payloadRaw = formData.get("payload") as string | null
    if (!payloadRaw) {
      return NextResponse.json({ error: "Missing payload" }, { status: 400 })
    }

    const payload = JSON.parse(payloadRaw)

    // Extract files
    const files: File[] = []
    for (const entry of formData.getAll("files")) {
      if (entry instanceof File) files.push(entry)
    }


    // Create a job and return jobId to client; run validation & evaluation asynchronously and emit progress
    const job = createJob()
    const jobId = job.id

    // Fire-and-forget worker
    ;(async () => {
      try {
        job.emitProgress("received", { message: "Files received" })

        const validation = await validateDocumentsWithAgent({ files, payload, jobId })
        if (!validation.ok) {
          job.emitProgress("invalid_documents", { details: validation })
          job.emitProgress("finished", { ok: false })
          removeJob(jobId)
          return
        }

        job.emitProgress("validated", { message: "Documents validated" })

        // Proceed with AI-powered evaluation using metadata
        job.emitProgress("generating", { message: "Generating evaluation with AI" })
        const evaluation = await generateEvaluation({
          country: payload.country,
          visaType: payload.visaType,
          uploadedDocuments: payload.docsMeta || [],
          name: payload.name,
          email: payload.email,
        })

        job.emitProgress("scored", { score: evaluation.score })

        // Store in DB
        const storedEvaluation = await storeEvaluation({
          ...payload,
          ...evaluation,
          timestamp: new Date(),
        })

        job.emitProgress("stored", { evaluationId: storedEvaluation.id })

        // Generate PDF report with enhanced structure
        const pdfBuffer = await generateReportPdf({
          name: payload.name,
          email: payload.email,
          country: payload.country,
          visaType: payload.visaType,
          score: evaluation.score,
          summary: evaluation.summary,
          strengths: evaluation.strengths,
          improvements: evaluation.improvements,
          recommendation: evaluation.recommendation,
          // @ts-expect-error - optional fields may not exist on all evaluation types
          nextSteps: evaluation.nextSteps,
          // @ts-expect-error - optional field
          timeline: evaluation.timeline,
          // @ts-expect-error - optional field
          additionalNotes: evaluation.additionalNotes,
          evaluationId: storedEvaluation.id,
        })

        job.emitProgress("pdf_generated", { size: pdfBuffer.length })

        // Prepare user documents as attachments
        const userDocuments: Array<{ filename: string; content: Buffer }> = []
        for (const file of files) {
          const arrayBuffer = await file.arrayBuffer()
          userDocuments.push({
            filename: file.name,
            content: Buffer.from(arrayBuffer),
          })
        }

        // Automatically send email with PDF attached using Resend
        job.emitProgress("sending_email", { message: "Sending email to user" })
        const emailSent = await sendEvaluationEmail({
          email: payload.email,
          name: payload.name,
          country: payload.country,
          visaType: payload.visaType,
          score: evaluation.score,
          summary: evaluation.summary,
          recommendation: evaluation.recommendation,
          strengths: evaluation.strengths,
          improvements: evaluation.improvements,
          evaluationId: storedEvaluation.id,
          attachment: {
            filename: `Evaluation-Report-${storedEvaluation.id}.pdf`,
            content: pdfBuffer,
          },
          userDocuments,
        })

        if (emailSent) {
          job.emitProgress("email_sent", { message: "Email sent successfully" })
        } else {
          job.emitProgress("email_failed", { message: "Email sending failed" })
        }

        job.emitProgress("finished", { ok: true, evaluationId: storedEvaluation.id })
      } catch (err) {
        job.emitProgress("error", { message: String(err) })
        job.emitProgress("finished", { ok: false })
      } finally {
        // keep job around briefly for client to fetch last events, remove after 30s
        setTimeout(() => removeJob(jobId), 30_000)
      }
    })()

    // Return immediately with jobId so client can open SSE stream
    return NextResponse.json({ jobId })
  } catch (error) {
    console.error("Evaluation error:", error)
    return NextResponse.json({ error: "Failed to process evaluation" }, { status: 500 })
  }
}
