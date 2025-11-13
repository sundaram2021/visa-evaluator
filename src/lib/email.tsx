import { Resend } from "resend"

// Configure Resend client
const resendClient = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

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
  attachment?: { filename: string; content: Buffer }
  userDocuments?: Array<{ filename: string; content: Buffer }>
}

interface EmailPayload {
  from: string
  to: string[]
  subject: string
  html: string
  attachments?: Array<{ filename: string; content: Buffer }>
}

export async function sendEvaluationEmail(data: EvaluationData) {
  const htmlContent = generateEmailHTML(data)

  try {
    if (!resendClient) {
      console.error("Resend API key not configured")
      throw new Error("Resend API key not configured")
    }

    console.log("Sending email to:", data.email)
    console.log("From:", process.env.EMAIL_FROM || "onboarding@resend.dev")
    console.log("Attachment:", data.attachment ? "Yes" : "No")

    const emailPayload: EmailPayload = {
      from: process.env.EMAIL_FROM || "onboarding@resend.dev",
      to: [data.email],
      subject: `Your Visa Evaluation Report is Ready`,
      html: htmlContent,
    }

    // Add attachments: report PDF and user documents
    const attachments: Array<{ filename: string; content: Buffer }> = []

    // Add the evaluation report PDF
    if (data.attachment) {
      attachments.push({
        filename: data.attachment.filename,
        content: data.attachment.content,
      })
    }

    // Add user-uploaded documents
    if (data.userDocuments && data.userDocuments.length > 0) {
      attachments.push(...data.userDocuments)
    }

    if (attachments.length > 0) {
      emailPayload.attachments = attachments
    }

    const result = await resendClient.emails.send(emailPayload)

    console.log("Email sent successfully:", result)
    return true
  } catch (error) {
    console.error("Error sending email:", error)
    console.error("Error details:", JSON.stringify(error, null, 2))
    return false
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function generateEmailHTML(data: EvaluationData): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif;
            line-height: 1.6; 
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background-color: #ffffff;
          }
          .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; 
            padding: 30px 40px;
            text-align: center;
          }
          .header h1 { 
            margin: 0;
            font-size: 28px;
            font-weight: 600;
          }
          .content {
            padding: 40px;
          }
          .greeting {
            font-size: 16px;
            margin-bottom: 20px;
            color: #333;
          }
          .intro-text {
            font-size: 14px;
            line-height: 1.8;
            color: #333;
            margin-bottom: 24px;
          }
          .evaluation-list {
            margin: 24px 0;
            padding-left: 20px;
          }
          .evaluation-list li {
            font-size: 14px;
            line-height: 1.8;
            color: #333;
            margin-bottom: 8px;
          }
          .support-text {
            font-size: 14px;
            line-height: 1.8;
            color: #333;
            margin: 24px 0;
          }
          .note-box {
            background-color: #f8f9fa;
            border-left: 4px solid #667eea;
            padding: 16px;
            margin: 24px 0;
            border-radius: 4px;
          }
          .note-box strong {
            display: block;
            font-size: 14px;
            color: #667eea;
            margin-bottom: 8px;
          }
          .note-box p {
            margin: 0;
            font-size: 13px;
            line-height: 1.6;
            color: #666;
          }
          .closing {
            font-size: 14px;
            margin-top: 32px;
            color: #333;
          }
          .signature {
            font-size: 14px;
            margin-top: 8px;
            color: #667eea;
            font-weight: 600;
          }
          .footer {
            background-color: #f8f9fa;
            padding: 24px 40px;
            text-align: center;
            border-top: 1px solid #e9ecef;
          }
          .footer p {
            margin: 8px 0;
            font-size: 12px;
            color: #6c757d;
            line-height: 1.6;
          }
          .footer-link {
            color: #667eea;
            text-decoration: none;
          }
          .copyright {
            margin-top: 16px;
            font-size: 11px;
            color: #999;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>LegalAI</h1>
          </div>

          <div class="content">
            <p class="greeting">Hi,</p>
            
            <p class="intro-text">
              Great news! Your visa evaluation report is ready. We've completed a thorough analysis of your profile and prepared detailed insights on your eligibility.
            </p>

            <p class="intro-text">Your evaluation includes:</p>

            <ul class="evaluation-list">
              <li>A comprehensive assessment of your eligibility</li>
              <li>Personalized recommendations based on your profile</li>
              <li>Clear next steps to guide your immigration journey</li>
            </ul>

            <p class="support-text">
              If you have any questions or need assistance understanding your evaluation, please don't hesitate to reach out. We're here to support you throughout this process.
            </p>

            <div class="note-box">
              <strong>Note:</strong>
              <p>
                LegalAI is a technology company that provides visa application assistance. We are not a law firm and do not provide legal advice. For legal counsel, please consult with a licensed immigration attorney.
              </p>
            </div>

            <p class="closing">Thank you,</p>
            <p class="signature">LegalAI</p>
          </div>

          <div class="footer">
            <p>
              If you have any questions or need assistance, please don't hesitate to contact us.
            </p>
            <p class="copyright">
              © ${new Date().getFullYear()} LegalAI. All rights reserved.<br>
              Powered by <a href="#" class="footer-link">LegalAI</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `
}
