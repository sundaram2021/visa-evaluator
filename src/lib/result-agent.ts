import { GoogleGenAI } from "@google/genai"

interface GenerateResultParams {
  name: string
  email: string
  country: string
  visaType: string
  uploadedDocuments: Array<{ name: string; type: "required" | "optional" }>
  score: number
}

interface EvaluationResult {
  score: number
  recommendation: string
  summary: string
  strengths: string[]
  improvements: string[]
  nextSteps: string[]
  timeline: string
  additionalNotes: string
}

export async function generateEvaluationWithAI(params: GenerateResultParams): Promise<EvaluationResult> {
  const GENAI_API_KEY = process.env.GENAI_API_KEY || process.env.GOOGLE_GENAI_API_KEY

  if (!GENAI_API_KEY) {
    console.warn("GenAI API key not configured, using fallback evaluation")
    return generateFallbackEvaluation(params)
  }

  try {
    const ai = new GoogleGenAI({ apiKey: GENAI_API_KEY })

    const prompt = `You are an expert visa evaluation consultant. Analyze the following visa application and provide a comprehensive evaluation.

Application Details:
- Applicant: ${params.name}
- Country: ${params.country}
- Visa Type: ${params.visaType}
- Preliminary Score: ${params.score}%
- Documents Uploaded: ${params.uploadedDocuments.length} (${params.uploadedDocuments.filter(d => d.type === "required").length} required, ${params.uploadedDocuments.filter(d => d.type === "optional").length} optional)
- Document List: ${params.uploadedDocuments.map(d => `${d.name} (${d.type})`).join(", ")}

Provide a detailed evaluation in JSON format with the following structure:
{
  "score": <number 0-100>,
  "recommendation": "<one clear recommendation: Highly Recommended / Recommended / Proceed with Caution / Not Recommended>",
  "summary": "<2-3 sentence comprehensive summary of the application strength>",
  "strengths": [<array of 3-5 specific strengths about this application>],
  "improvements": [<array of 3-5 specific actionable improvements>],
  "nextSteps": [<array of 3-4 concrete next steps the applicant should take>],
  "timeline": "<realistic timeline estimate like '4-6 weeks' or '2-3 months'>",
  "additionalNotes": "<1-2 sentences of additional important information or warnings>"
}

Be specific, professional, and constructive. Focus on the ${params.visaType} visa requirements for ${params.country}.`

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    })

    const textResponse = response.text || ""
    
    // Extract JSON from response (might be wrapped in markdown code blocks)
    let jsonText = textResponse
    const jsonMatch = textResponse.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/)
    if (jsonMatch && jsonMatch[1]) {
      jsonText = jsonMatch[1]
    }

    const result = JSON.parse(jsonText || "{}")

    // Validate and sanitize result
    return {
      score: typeof result.score === "number" ? Math.round(Math.max(0, Math.min(100, result.score))) : params.score,
      recommendation: result.recommendation || getRecommendationFromScore(params.score),
      summary: result.summary || "Your visa application has been evaluated.",
      strengths: Array.isArray(result.strengths) ? result.strengths.slice(0, 5) : [],
      improvements: Array.isArray(result.improvements) ? result.improvements.slice(0, 5) : [],
      nextSteps: Array.isArray(result.nextSteps) ? result.nextSteps.slice(0, 4) : [],
      timeline: result.timeline || "4-8 weeks",
      additionalNotes: result.additionalNotes || "",
    }
  } catch (error) {
    console.error("Error generating AI evaluation:", error)
    return generateFallbackEvaluation(params)
  }
}

function generateFallbackEvaluation(params: GenerateResultParams): EvaluationResult {
  const score = params.score
  const recommendation = getRecommendationFromScore(score)

  return {
    score,
    recommendation,
    summary: `Your ${params.visaType} visa application for ${params.country} has been evaluated with a score of ${score}%. ${
      score >= 70
        ? "Your application shows strong potential."
        : "There are areas that need improvement to strengthen your application."
    }`,
    strengths: [
      `Submitted ${params.uploadedDocuments.filter(d => d.type === "required").length} required documents`,
      "Application profile is complete",
      "All mandatory fields are filled",
    ],
    improvements: [
      score < 70 ? "Consider adding more supporting documents" : "Minor documentation improvements possible",
      "Review document quality and clarity",
      "Ensure all information is up-to-date",
    ],
    nextSteps: [
      "Review the detailed report attached",
      "Address any areas marked for improvement",
      "Prepare for potential interview",
      "Monitor application status regularly",
    ],
    timeline: score >= 70 ? "4-6 weeks" : "6-8 weeks",
    additionalNotes: "This is an automated evaluation. For legal advice, consult with an immigration professional.",
  }
}

function getRecommendationFromScore(score: number): string {
  if (score >= 80) return "Highly Recommended"
  if (score >= 65) return "Recommended"
  if (score >= 45) return "Proceed with Caution"
  return "Not Recommended"
}

export default generateEvaluationWithAI
