import nodemailer from "nodemailer"

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: Number.parseInt(process.env.EMAIL_PORT || "587"),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
})

interface EvaluationData {
  email: string
  name: string
  country: string
  visaType: string
  score: number
  summary: string
  recommendation: string
  strengths: string[]
  improvements: string[]
  evaluationId: string
}

export async function sendEvaluationEmail(data: EvaluationData) {
  const htmlContent = generateEmailHTML(data)

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: data.email,
      subject: `Your Visa Evaluation Results - ${data.country} ${data.visaType}`,
      html: htmlContent,
      text: generateEmailText(data),
    })

    console.log(`Email sent successfully to ${data.email}`)
    return true
  } catch (error) {
    console.error("Error sending email:", error)
    return false
  }
}

function generateEmailHTML(data: EvaluationData): string {
  const scoreColor =
    data.score >= 80 ? "#10b981" : data.score >= 60 ? "#3b82f6" : data.score >= 40 ? "#f59e0b" : "#ef4444"

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1f2937; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .score-box { 
            background: ${scoreColor}20;
            border-left: 4px solid ${scoreColor};
            padding: 20px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .score-number { 
            font-size: 48px;
            font-weight: bold;
            color: ${scoreColor};
            text-align: center;
          }
          .score-label { text-align: center; color: #666; margin-top: 10px; }
          .section { margin: 20px 0; }
          .section-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
          .item { margin: 8px 0; padding: 8px; background: #f9fafb; border-radius: 4px; }
          .strength { border-left: 3px solid #10b981; padding-left: 12px; }
          .improvement { border-left: 3px solid #f59e0b; padding-left: 12px; }
          .footer { background: #f3f4f6; padding: 20px; border-radius: 0 0 8px 8px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Global Visa Evaluation Results</h1>
            <p>Evaluation for ${data.country} - ${data.visaType}</p>
          </div>

          <div class="score-box">
            <div class="score-number">${data.score}%</div>
            <div class="score-label">${data.recommendation}</div>
          </div>

          <div class="section">
            <div class="section-title">Summary</div>
            <p>${data.summary}</p>
          </div>

          <div class="section">
            <div class="section-title">✓ Your Strengths</div>
            ${data.strengths.map((s) => `<div class="item strength">${s}</div>`).join("")}
          </div>

          <div class="section">
            <div class="section-title">! Areas for Improvement</div>
            ${data.improvements.map((i) => `<div class="item improvement">${i}</div>`).join("")}
          </div>

          <div class="section">
            <p><strong>Application Details:</strong></p>
            <ul>
              <li>Name: ${data.name}</li>
              <li>Country: ${data.country}</li>
              <li>Visa Type: ${data.visaType}</li>
              <li>Evaluation ID: ${data.evaluationId}</li>
            </ul>
          </div>

          <div class="footer">
            <p>This is an automated evaluation. For legal advice, please consult with an immigration professional.</p>
            <p>&copy; 2025 Global Visa Evaluation. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `
}

function generateEmailText(data: EvaluationData): string {
  return `
Global Visa Evaluation Results

Evaluation for: ${data.country} - ${data.visaType}

Your Score: ${data.score}%
${data.recommendation}

Summary:
${data.summary}

Your Strengths:
${data.strengths.map((s) => `- ${s}`).join("\n")}

Areas for Improvement:
${data.improvements.map((i) => `- ${i}`).join("\n")}

Application Details:
Name: ${data.name}
Country: ${data.country}
Visa Type: ${data.visaType}
Evaluation ID: ${data.evaluationId}

This is an automated evaluation. For legal advice, please consult with an immigration professional.
© 2025 Global Visa Evaluation. All rights reserved.
  `
}
