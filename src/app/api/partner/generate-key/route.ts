import { type NextRequest, NextResponse } from "next/server"
import { randomBytes } from "crypto"
import { updateEvaluationApiKey, getEvaluationById } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { jobId } = body

    if (!jobId) {
      return NextResponse.json({ error: "jobId is required" }, { status: 400 })
    }

    // Verify the evaluation exists
    const evaluation = await getEvaluationById(jobId)
    if (!evaluation) {
      return NextResponse.json({ error: "Evaluation not found" }, { status: 404 })
    }

    // Check if API key already exists
    if (evaluation.apiKey) {
      return NextResponse.json({
        apiKey: evaluation.apiKey,
        jobId,
        message: "API key already exists for this evaluation"
      })
    }

    // Generate a unique API key
    const apiKey = `vak_${randomBytes(32).toString("hex")}`

    // Store the API key in the database
    const updated = await updateEvaluationApiKey(jobId, apiKey)
    
    if (!updated) {
      return NextResponse.json({ error: "Failed to create API key" }, { status: 500 })
    }

    return NextResponse.json({
      apiKey,
      jobId,
      message: "API key created successfully"
    })
  } catch (error) {
    console.error("Error generating API key:", error)
    return NextResponse.json({ error: "Failed to generate API key" }, { status: 500 })
  }
}
