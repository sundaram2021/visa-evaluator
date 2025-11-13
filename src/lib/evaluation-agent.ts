import { getJob } from "@/lib/job-manager"
import { VISA_CONFIG } from "@/lib/config"

interface ValidateParams {
  files: any[]
  payload: Record<string, any>
  jobId?: string
}

interface ValidationResult {
  ok: boolean
  issues?: { fileName: string; reason: string }[]
  details?: Record<string, any>
}

// Try to use Google GenAI when API key is configured for deeper document validation.
// Otherwise, fallback to lightweight validation (mime/type, count, required docs presence).
export async function validateDocumentsWithAgent({ files, payload, jobId }: ValidateParams): Promise<ValidationResult> {
  const job = jobId ? getJob(jobId) : null
  if (job) job.emitProgress("started", { message: "Starting document validation" })
  // Basic checks
  if (!files || files.length === 0) {
    if (job) job.emitProgress("error", { message: "No files uploaded" })
    return { ok: false, issues: [{ fileName: "", reason: "No files uploaded" }] }
  }

  if (files.length > 6) {
    if (job) job.emitProgress("error", { message: "Too many files - max 6 allowed" })
    return { ok: false, issues: [{ fileName: "", reason: "Too many files - max 6 allowed" }] }
  }

  // Determine required docs: prefer payload.docsMeta, otherwise fall back to config mapping
  const isTestCountry = (payload?.country || "").toLowerCase() === "test"
  let requiredDocs = (payload?.docsMeta || []).filter((d: any) => d.type === "required")
  if ((!requiredDocs || requiredDocs.length === 0) && payload?.country && payload?.visaType) {
    const cfg = (VISA_CONFIG as any)[payload.country]
    const visaCfg = cfg?.visas?.[payload.visaType]
    if (visaCfg && visaCfg.requiredDocuments) {
      requiredDocs = visaCfg.requiredDocuments.map((n: string) => ({ name: n, type: "required" }))
    }
  }

  if (!isTestCountry && (!requiredDocs || requiredDocs.length === 0)) {
    if (job) job.emitProgress("error", { message: "Missing required documents metadata" })
    return { ok: false, issues: [{ fileName: "", reason: "Missing required documents metadata" }] }
  }

  // Produce OCR text snippets (best-effort) to include in the agent prompt
  const ocrSnippets: { fileName: string; text?: string }[] = []
//   const isTestCountry = (payload?.country || "").toLowerCase() === "test"

  for (const f of files.slice(0, 6)) {
    try {
      if (job) job.emitProgress("ocr", { message: `Running OCR for ${f.name}` })
      // Skip OCR for Test country to avoid heavy deps and false negatives
      if (isTestCountry) {
        ocrSnippets.push({ fileName: f.name || f.fileName || "unknown", text: "" })
        continue
      }

      // Dynamic import to avoid crashing when tesseract.js is not installed or not supported in environment
      let Tesseract: any = null
      try {
        const mod = await import("tesseract.js")
        Tesseract = (mod as any).default || mod
      } catch (err) {
        if (job) job.emitProgress("ocr_import_error", { message: String(err) })
        ocrSnippets.push({ fileName: f.name || f.fileName || "unknown", text: "" })
        continue
      }

      // Tesseract recognizes image blobs; convert File/Blob to ArrayBuffer
      if (f.arrayBuffer) {
        const buffer = Buffer.from(await f.arrayBuffer())
        const { data } = await Tesseract.recognize(buffer, "eng")
        const snippet = data?.text?.trim?.() || ""
        ocrSnippets.push({ fileName: f.name || f.fileName || "unknown", text: snippet.slice(0, 200) })
      }
    } catch (e) {
      // ignore OCR failures; continue
      if (job) job.emitProgress("ocr_error", { message: `OCR failed for ${f.name}` })
      ocrSnippets.push({ fileName: f.name || f.fileName || "unknown", text: "" })
    }
  }

  if (job) job.emitProgress("ocr_done", { snippets: ocrSnippets })

  // Heuristic checks on OCR: low-quality scans or missing applicant name
  const issues: { fileName: string; reason: string }[] = []
  const applicantName = (payload?.name || "").toLowerCase()
  const nameTokens = applicantName.split(" ").filter(Boolean)

  // If any required doc seems identity-related, ensure OCR contains the applicant name
  for (const req of requiredDocs) {
    const rn = (req.name || req.fileName || "").toLowerCase()
    const isIdLike = /passport|id card|identity|birth|certificate|degree/i.test(rn)
    // For test country or resume-like required docs, skip strict identity name checks
    if (isIdLike && !isTestCountry) {
      // check OCR snippets for presence of at least one name token
      const found = ocrSnippets.some((s) => {
        const txt = (s.text || "").toLowerCase()
        return nameTokens.every((tok) => txt.includes(tok)) || nameTokens.some((tok) => txt.includes(tok))
      })
      if (!found) {
        issues.push({ fileName: rn || "identity", reason: "Applicant name not detected in OCR of identity documents - possible low-quality scan or wrong document." })
      }
    }
  }

  // Low-quality scan detection: if all OCR snippets are very short, mark as low-quality
  const avgOcrLen = ocrSnippets.reduce((s, x) => s + ((x.text || "").length || 0), 0) / Math.max(1, ocrSnippets.length)
  if (avgOcrLen < 30 && !isTestCountry) {
    issues.push({ fileName: "all", reason: "Scans appear low-quality or text not legible. Please upload clearer scans (high-resolution photos or PDFs)." })
  }

  if (issues.length > 0) {
    if (job) job.emitProgress("invalid_documents", { issues })
    return { ok: false, issues }
  }

  // If GENAI key is configured, make a best-effort call to validate contents.
  const GENAI_API_KEY = process.env.GENAI_API_KEY || process.env.GOOGLE_GENAI_API_KEY
  if (GENAI_API_KEY && false) { // Disabled for now - using basic validation
    try {
      // The implementation below is illustrative and uses the @google/genai Node SDK.
      // It packages file metadata and short base64 previews (not full binary) to avoid large payloads.
      // Always instruct the model not to hallucinate and only reason based on the provided files.

      // Dynamic import to avoid hard crash when package is not installed
      let GoogleGenAI: unknown = null
      try {
        const mod = await import("@google/genai")
        GoogleGenAI = (mod as Record<string, unknown>).GoogleGenAI || (mod as Record<string, unknown>).default
      } catch (err) {
        // if import fails, let it fall through to fallback
        if (job) job.emitProgress("agent_import_error", { message: String(err) })
      }

      if (!GoogleGenAI) {
        throw new Error("@google/genai is not available")
      }

      const fileSummaries = await Promise.all(
        files.slice(0, 6).map(async (f: File) => {
          // read small preview of file (first bytes) as base64 for model to check mime/headers
          let previewBase64 = ""
          try {
            if (f.arrayBuffer) {
              const buf = Buffer.from(await f.arrayBuffer())
              previewBase64 = buf.slice(0, 8192).toString("base64")
            }
          } catch (err) {
            // ignore
          }

          const ocr = ocrSnippets.find((s) => s.fileName === (f.name || "unknown"))
          return { name: f.name || "unknown", size: f.size || 0, previewBase64, ocrText: ocr?.text || "" }
        }),
      )

      const systemPrompt = `You are a strict document validation assistant for visa evaluation. DO NOT HALLUCINATE. Only use the provided file names, file metadata, OCR snippets and previews to determine if a document appears to be valid, legible, and correctly named for the selected visa type. If you cannot determine, respond with "unknown" for that file and recommend reupload. Respond JSON only with keys: ok:boolean, issues:[{fileName,reason}], details: any.`

      // This is placeholder code - actual implementation would use GoogleGenAI API
      const ai = new (GoogleGenAI as never)({ apiKey: GENAI_API_KEY })
      const prompt = `System: ${systemPrompt}\n\nContext:\nCountry: ${payload.country}\nVisaType: ${payload.visaType}\nDocsMeta: ${JSON.stringify(payload.docsMeta || [])}\nFiles: ${JSON.stringify(fileSummaries)}\nOCR: ${JSON.stringify(ocrSnippets)}\n\nPlease validate each uploaded file and only rely on the provided file metadata, OCR snippets and previews.`

      const resp = await (ai as never).models.generateContent({
        model: "gemini-2.0-flash-001",
        contents: prompt,
      })

      const text = String((resp as Record<string, unknown>).text || resp)
      try {
        const parsed = JSON.parse(text)
        if (job) job.emitProgress("agent_done", { parsed })
        return { ok: Boolean(parsed.ok), issues: parsed.issues || [], details: parsed.details }
      } catch (e) {
        // If model couldn't return JSON, fallback to optimistic accept
        if (job) job.emitProgress("agent_error", { raw: text })
        return { ok: true, details: { raw: text } }
      }
    } catch (e) {
      console.error("GenAI validation failed, falling back to basic checks:", e)
      if (job) job.emitProgress("agent_exception", { message: String(e) })
      // continue to basic checks
    }
  }

  // Basic heuristic: for test country be lenient — accept if required count uploaded; otherwise ensure required doc name appears in filenames
  const filenames = files.map((f) => (f.name || f.fileName || "")).join(" ")
  const missing: { fileName: string; reason: string }[] = []
  if (isTestCountry) {
    const uploadedCount = files.length
    if (uploadedCount < requiredDocs.length) {
      missing.push({ fileName: "required", reason: "Not enough documents uploaded for Test Country" })
    }
  } else {
    for (const req of requiredDocs) {
      if (!filenames.toLowerCase().includes((req.name || req.fileName || "").toLowerCase())) {
        missing.push({ fileName: req.name || req.fileName || "required", reason: "Required document not detected in uploaded files by name" })
      }
    }
  }

  if (missing.length > 0) return { ok: false, issues: missing }

  // Build a lightweight summary and score so callers (and test flows) always get
  // consistent outputs. For test country be lenient but still emit a score and summary
  // so UI/workers can proceed with downstream steps (report, evaluation summary etc.).
  const reqCount = (requiredDocs || []).length
  let score = 100
  if (isTestCountry) {
    const uploadedCount = files.length
    score = reqCount > 0 ? Math.round(Math.min(100, (uploadedCount / reqCount) * 100)) : 100
  } else {
    // Score is percent of required docs matched by filename heuristics
    if (reqCount > 0) {
      const matched = (requiredDocs || []).filter((req: unknown) => {
        const r = req as Partial<Record<string, string>>
        const rn = String(r.name ?? r.fileName ?? "")
        return filenames.toLowerCase().includes(rn.toLowerCase())
      }).length
      score = Math.round((matched / reqCount) * 100)
    } else {
      score = 100
    }
  }

  const summary = {
    ok: true,
    score,
    requiredDocs: requiredDocs || [],
    uploadedFiles: files.map((f) => {
      const fi = f as Partial<Record<string, unknown>>
      return { name: String(fi.name ?? fi.fileName ?? "unknown"), size: Number(fi.size ?? 0) }
    }),
    ocrSnippets,
  }

    if (job) {
    try {
      job.emitProgress("summary", { summary })
      job.emitProgress("completed", { ok: true, score })
    } catch {
      // ensure non-fatal if emit fails
    }
  }

  return { ok: true, details: summary }
}

export default validateDocumentsWithAgent
