import { PDFDocument, StandardFonts, rgb } from "pdf-lib"

interface ReportParams {
  name: string
  email: string
  country: string
  visaType: string
  score: number
  summary: string
  strengths: string[]
  improvements: string[]
  evaluationId: string
  recommendation?: string
  nextSteps?: string[]
  timeline?: string
  additionalNotes?: string
}

export async function generateReportPdf(params: ReportParams) {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([595, 842]) // A4
  const width = 595
  const height = 842

  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica)

  const margin = 50
  let y = height - margin

  // Header Background
  page.drawRectangle({
    x: 0,
    y: height - 120,
    width,
    height: 120,
    color: rgb(0.13, 0.27, 0.53), // Dark blue
  })

  // Title
  page.drawText("VISA EVALUATION REPORT", {
    x: margin,
    y: y - 20,
    size: 24,
    font: boldFont,
    color: rgb(1, 1, 1),
  })

  // Subtitle
  page.drawText(`${params.country} - ${params.visaType}`, {
    x: margin,
    y: y - 45,
    size: 14,
    font: regularFont,
    color: rgb(0.9, 0.9, 0.9),
  })

  // Evaluation ID
  page.drawText(`Evaluation ID: ${params.evaluationId}`, {
    x: margin,
    y: y - 70,
    size: 9,
    font: regularFont,
    color: rgb(0.8, 0.8, 0.8),
  })

  y -= 140

  // Applicant Information Box
  page.drawRectangle({
    x: margin,
    y: y - 60,
    width: width - 2 * margin,
    height: 60,
    color: rgb(0.95, 0.97, 1),
    borderColor: rgb(0.7, 0.8, 0.95),
    borderWidth: 1,
  })

  page.drawText("APPLICANT INFORMATION", {
    x: margin + 10,
    y: y - 20,
    size: 10,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2),
  })

  page.drawText(`Name: ${params.name}`, {
    x: margin + 10,
    y: y - 38,
    size: 10,
    font: regularFont,
    color: rgb(0.3, 0.3, 0.3),
  })

  page.drawText(`Email: ${params.email}`, {
    x: margin + 10,
    y: y - 52,
    size: 10,
    font: regularFont,
    color: rgb(0.3, 0.3, 0.3),
  })

  y -= 80

  // Score Card
  const scoreColor = params.score >= 80 ? rgb(0.13, 0.69, 0.3) : params.score >= 65 ? rgb(0.2, 0.5, 0.9) : params.score >= 45 ? rgb(0.96, 0.65, 0.14) : rgb(0.9, 0.17, 0.17)

  page.drawRectangle({
    x: margin,
    y: y - 80,
    width: width - 2 * margin,
    height: 80,
    color: rgb(0.98, 0.98, 1),
    borderColor: scoreColor,
    borderWidth: 3,
  })

  page.drawText("ELIGIBILITY SCORE", {
    x: margin + 15,
    y: y - 25,
    size: 11,
    font: boldFont,
    color: rgb(0.3, 0.3, 0.3),
  })

  page.drawText(`${params.score}%`, {
    x: margin + 15,
    y: y - 55,
    size: 36,
    font: boldFont,
    color: scoreColor,
  })

  page.drawText(params.recommendation || "Recommended", {
    x: margin + 120,
    y: y - 50,
    size: 14,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2),
  })

  if (params.timeline) {
    page.drawText(`Timeline: ${params.timeline}`, {
      x: margin + 120,
      y: y - 68,
      size: 10,
      font: regularFont,
      color: rgb(0.4, 0.4, 0.4),
    })
  }

  y -= 100

  // Executive Summary
  page.drawText("EXECUTIVE SUMMARY", {
    x: margin,
    y,
    size: 12,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2),
  })

  page.drawLine({
    start: { x: margin, y: y - 5 },
    end: { x: width - margin, y: y - 5 },
    thickness: 2,
    color: rgb(0.13, 0.27, 0.53),
  })

  y -= 20
  const summaryLines = splitTextIntoLines(params.summary, 75)
  for (const line of summaryLines) {
    page.drawText(line, { x: margin, y, size: 10, font: regularFont, color: rgb(0.2, 0.2, 0.2) })
    y -= 14
    if (y < margin + 100) break
  }

  y -= 10

  // Key Strengths
  page.drawText("KEY STRENGTHS", {
    x: margin,
    y,
    size: 12,
    font: boldFont,
    color: rgb(0.13, 0.69, 0.3),
  })

  page.drawLine({
    start: { x: margin, y: y - 5 },
    end: { x: width - margin, y: y - 5 },
    thickness: 2,
    color: rgb(0.13, 0.69, 0.3),
  })

  y -= 18
  for (let i = 0; i < params.strengths.length && y > margin + 80; i++) {
    const lines = splitTextIntoLines(`${i + 1}. ${params.strengths[i]}`, 72)
    for (const line of lines) {
      page.drawText(line, { x: margin + 5, y, size: 9, font: regularFont, color: rgb(0.2, 0.2, 0.2) })
      y -= 12
      if (y < margin + 80) break
    }
  }

  if (y < margin + 180) {
    // Add new page if needed
    const page2 = pdfDoc.addPage([595, 842])
    y = height - margin

    // Areas for Improvement on new page
    page2.drawText("AREAS FOR IMPROVEMENT", {
      x: margin,
      y,
      size: 12,
      font: boldFont,
      color: rgb(0.96, 0.65, 0.14),
    })

    page2.drawLine({
      start: { x: margin, y: y - 5 },
      end: { x: width - margin, y: y - 5 },
      thickness: 2,
      color: rgb(0.96, 0.65, 0.14),
    })

    y -= 18
    for (let i = 0; i < params.improvements.length && y > margin + 100; i++) {
      const lines = splitTextIntoLines(`${i + 1}. ${params.improvements[i]}`, 72)
      for (const line of lines) {
        page2.drawText(line, { x: margin + 5, y, size: 9, font: regularFont, color: rgb(0.2, 0.2, 0.2) })
        y -= 12
        if (y < margin + 100) break
      }
    }

    // Next Steps
    if (params.nextSteps && params.nextSteps.length > 0 && y > margin + 80) {
      y -= 10
      page2.drawText("RECOMMENDED NEXT STEPS", {
        x: margin,
        y,
        size: 12,
        font: boldFont,
        color: rgb(0.45, 0.33, 0.75),
      })

      page2.drawLine({
        start: { x: margin, y: y - 5 },
        end: { x: width - margin, y: y - 5 },
        thickness: 2,
        color: rgb(0.45, 0.33, 0.75),
      })

      y -= 18
      for (let i = 0; i < params.nextSteps.length && y > margin + 60; i++) {
        const lines = splitTextIntoLines(`${i + 1}. ${params.nextSteps[i]}`, 72)
        for (const line of lines) {
          page2.drawText(line, { x: margin + 5, y, size: 9, font: regularFont, color: rgb(0.2, 0.2, 0.2) })
          y -= 12
          if (y < margin + 60) break
        }
      }
    }

    // Footer
    if (params.additionalNotes) {
      page2.drawRectangle({
        x: margin,
        y: margin,
        width: width - 2 * margin,
        height: 45,
        color: rgb(0.98, 0.98, 0.9),
        borderColor: rgb(0.8, 0.8, 0.7),
        borderWidth: 1,
      })

      const noteLines = splitTextIntoLines(params.additionalNotes, 80)
      let noteY = margin + 32
      for (const line of noteLines.slice(0, 2)) {
        page2.drawText(line, { x: margin + 8, y: noteY, size: 8, font: regularFont, color: rgb(0.3, 0.3, 0.3) })
        noteY -= 10
      }
    }
  } else {
    // Areas for Improvement on same page
    y -= 10
    page.drawText("AREAS FOR IMPROVEMENT", {
      x: margin,
      y,
      size: 12,
      font: boldFont,
      color: rgb(0.96, 0.65, 0.14),
    })

    page.drawLine({
      start: { x: margin, y: y - 5 },
      end: { x: width - margin, y: y - 5 },
      thickness: 2,
      color: rgb(0.96, 0.65, 0.14),
    })

    y -= 18
    for (let i = 0; i < params.improvements.length && y > margin + 20; i++) {
      const lines = splitTextIntoLines(`${i + 1}. ${params.improvements[i]}`, 72)
      for (const line of lines) {
        page.drawText(line, { x: margin + 5, y, size: 9, font: regularFont, color: rgb(0.2, 0.2, 0.2) })
        y -= 12
        if (y < margin + 20) break
      }
    }
  }

  // Footer on first page
  page.drawText("This evaluation is for informational purposes only. Consult with an immigration professional for official advice.", {
    x: margin,
    y: margin - 20,
    size: 7,
    font: regularFont,
    color: rgb(0.5, 0.5, 0.5),
  })

  const pdfBytes = await pdfDoc.save()
  return Buffer.from(pdfBytes)
}

function splitTextIntoLines(text: string, maxChars = 80) {
  const words = text.split(" ")
  const lines: string[] = []
  let cur = ""
  for (const w of words) {
    if ((cur + " " + w).trim().length > maxChars) {
      lines.push(cur.trim())
      cur = w
    } else {
      cur = `${cur} ${w}`
    }
  }
  if (cur.trim()) lines.push(cur.trim())
  return lines
}

export default generateReportPdf
