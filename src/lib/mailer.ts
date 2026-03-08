import nodemailer from "nodemailer"

const SMTP_HOST = process.env.SMTP_HOST
const SMTP_PORT = Number(process.env.SMTP_PORT || 587)
const SMTP_USER = process.env.SMTP_USER
const SMTP_PASS = process.env.SMTP_PASS
const SMTP_FROM = process.env.SMTP_FROM
const ADMIN_EMAIL = process.env.ADMIN_EMAIL

let transporterVerified: Promise<boolean> | null = null

export function canSendEmail() {
  return Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS && SMTP_FROM && ADMIN_EMAIL)
}

export function getEmailConfigIssues() {
  const issues: string[] = []
  if (!SMTP_HOST) issues.push("SMTP_HOST is missing")
  if (!SMTP_PORT || Number.isNaN(SMTP_PORT)) issues.push("SMTP_PORT is invalid")
  if (!SMTP_USER) issues.push("SMTP_USER is missing")
  if (!SMTP_PASS) issues.push("SMTP_PASS is missing")
  if (!SMTP_FROM) issues.push("SMTP_FROM is missing")
  if (!ADMIN_EMAIL) issues.push("ADMIN_EMAIL is missing")
  return issues
}

function getTransporter() {
  if (!canSendEmail()) {
    throw new Error(`Email service is not configured: ${getEmailConfigIssues().join(", ")}`)
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  })
}

async function verifyTransporter() {
  if (!transporterVerified) {
    const transporter = getTransporter()
    transporterVerified = transporter.verify()
  }
  await transporterVerified
}

export async function sendAdminEmail(subject: string, text: string, html?: string) {
  await verifyTransporter()
  const transporter = getTransporter()
  await transporter.sendMail({
    from: SMTP_FROM!,
    to: ADMIN_EMAIL!,
    subject,
    text,
    html: html ?? text,
  })
}
