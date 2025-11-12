import { VISA_CONFIG } from "./config"

export function generateEvaluation(formData: {
  country: string
  visaType: string
  uploadedDocuments: { name: string; type: "required" | "optional" }[]
  name: string
  email: string
}) {
  let score = 0

  const visaConfig = VISA_CONFIG[formData.country as keyof typeof VISA_CONFIG]
  if (!visaConfig) {
    return generateErrorEvaluation("Country not found")
  }

  const selectedVisa = (visaConfig.visas as any)[formData.visaType]
  if (!selectedVisa) {
    return generateErrorEvaluation("Visa type not found")
  }

  // Enhanced required documents scoring (0-40)
  const requiredDocs = selectedVisa.requiredDocuments || []
  const uploadedRequired = formData.uploadedDocuments.filter((d) => d.type === "required")
  const requiredDocScore = requiredDocs.length > 0 ? (uploadedRequired.length / requiredDocs.length) * 40 : 40
  score += requiredDocScore

  // Enhanced optional documents bonus (0-25)
  const optionalDocs = selectedVisa.optionalDocuments || []
  const uploadedOptional = formData.uploadedDocuments.filter((d) => d.type === "optional")
  const optionalDocScore =
    optionalDocs.length > 0 ? Math.min((uploadedOptional.length / optionalDocs.length) * 25, 25) : 0
  score += optionalDocScore

  // Enhanced visa type scoring (0-15)
  const visaScore = evaluateVisaType(formData.visaType, selectedVisa)
  score += visaScore

  // Enhanced profile evaluation (0-15)
  const profileScore = evaluateProfile(formData)
  score += profileScore

  score = Math.min(score, 85)

  const { summary, strengths, improvements, recommendation } = generateSummary(
    formData,
    score,
    requiredDocScore,
    optionalDocScore,
    visaScore,
    requiredDocs,
    uploadedRequired,
    optionalDocs,
    uploadedOptional,
  )

  return {
    score: Math.round(score),
    summary,
    strengths,
    improvements,
    recommendation,
  }
}

function evaluateProfile(formData: { name: string; email: string }): number {
  let score = 5

  // Email validation bonus
  if (formData.email && formData.email.includes("@")) {
    score += 5
  }

  // Name quality bonus
  if (formData.name && formData.name.split(" ").length >= 2) {
    score += 3
  }

  // Name length bonus
  if (formData.name && formData.name.length >= 5) {
    score += 2
  }

  return Math.min(score, 15)
}

function generateSummary(
  formData: any,
  score: number,
  requiredDocScore: number,
  optionalDocScore: number,
  visaScore: number,
  requiredDocs: string[],
  uploadedRequired: any[],
  optionalDocs: string[],
  uploadedOptional: any[],
) {
  const strengths: string[] = []
  const improvements: string[] = []

  const visaConfig = VISA_CONFIG[formData.country as keyof typeof VISA_CONFIG]
  const selectedVisa = (visaConfig?.visas as any)?.[formData.visaType]

  // Document completion analysis
  const docCompletionPercent = Math.round((uploadedRequired.length / requiredDocs.length) * 100)
  if (docCompletionPercent >= 80) {
    strengths.push(`${docCompletionPercent}% of required documents submitted - strong foundation`)
  } else if (docCompletionPercent >= 50) {
    strengths.push(`${docCompletionPercent}% of required documents submitted`)
    improvements.push(
      `Missing ${requiredDocs.length - uploadedRequired.length} required documents - prioritize submission`,
    )
  } else {
    improvements.push(`Only ${docCompletionPercent}% of required documents submitted - critical to complete`)
  }

  // Visa type assessment
  if (visaScore >= 14) {
    strengths.push("Selected visa type with high approval rates and favorable terms")
  } else if (visaScore >= 12) {
    strengths.push("Moderate visa category with reasonable processing timeline")
  } else {
    improvements.push("This visa category has strict requirements - consider alternative options")
  }

  // Optional documents bonus
  if (uploadedOptional.length > optionalDocs.length * 0.5) {
    strengths.push(`${uploadedOptional.length} additional documents strengthen your application significantly`)
  } else if (uploadedOptional.length > 0) {
    strengths.push("Additional documents submitted to strengthen your case")
  } else if (optionalDocs.length > 0) {
    improvements.push(`Consider uploading ${optionalDocs.length} optional documents to improve chances`)
  }

  // Success rate consideration
  if (selectedVisa?.successRate >= 85) {
    strengths.push(`Excellent success rate (${selectedVisa.successRate}%) for this visa type`)
  } else if (selectedVisa?.successRate >= 75) {
    strengths.push(`Good success rate (${selectedVisa.successRate}%) for this visa type`)
  } else {
    improvements.push(`Success rate for this visa is ${selectedVisa?.successRate}% - ensure all documents are perfect`)
  }

  // Processing time consideration
  improvements.push(`Expected processing time: ${selectedVisa?.processingTime}`)

  let recommendation = ""
  if (score >= 80) {
    recommendation = "Excellent fit - Ready to apply with confidence. Your application is well-prepared."
  } else if (score >= 70) {
    recommendation = "Good fit - Recommended to apply with current documents. Minor improvements possible."
  } else if (score >= 50) {
    recommendation = "Moderate fit - Gather additional documents before applying to improve chances significantly."
  } else {
    recommendation =
      "Below threshold - Critical to complete all required documents and consider alternative visa options."
  }

  const summary = `Your ${formData.visaType} visa eligibility score is ${score}/100. You have completed ${docCompletionPercent}% of required documentation (${uploadedRequired.length}/${requiredDocs.length}). Processing time typically takes ${selectedVisa?.processingTime}, with a historical success rate of ${selectedVisa?.successRate}%.`

  return { summary, strengths, improvements, recommendation }
}

function evaluateVisaType(visaType: string, visaConfig: any): number {
  const visaScoringMap: { [key: string]: number } = {
    "Tourist Visa": 18,
    "Schengen Tourist Visa": 18,
    "Visitor Visa": 18,
    "B1/B2 Tourism": 18,
    "Student Visa": 19,
    "F1 Student": 19,
    "Study Permit": 19,
    "Work Permit": 15,
    "Employment Visa": 16,
    "Work Visa": 15,
    "H1B Work": 14,
    "Express Entry": 12,
    "EU Blue Card": 14,
    "ICT Permit": 14,
    "Knowledge Migrant Permit": 15,
    "Highly Skilled Migrant": 15,
    "Critical Skills Employment Permit": 16,
    "Talent Passport": 13,
    "Salarié en Mission": 14,
    "Investor Visa": 10,
    "Golden Visa (3 years)": 12,
    Settlement: 10,
    "Indefinite Leave to Remain": 10,
    Migration: 8,
    "Permanent Migration": 8,
    "Digital Nomad Visa": 17,
    "General Employment Permit": 15,
    "Family Visa": 17,
    "Family/Dependent Visa": 17,
  }
  return visaScoringMap[visaType] || 15
}

function generateErrorEvaluation(message: string) {
  return {
    score: 0,
    summary: message,
    strengths: [],
    improvements: ["Unable to complete evaluation due to invalid selection"],
    recommendation: "Please review your selections and try again",
  }
}
