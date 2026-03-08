export const serviceRequestCategories = [
  "WEBSITE_DEVELOPMENT",
  "MOBILE_APP_DEVELOPMENT",
  "AI_SOLUTION",
  "SAAS_PLATFORM",
  "UI_UX_DESIGN",
  "TECHNICAL_SUPPORT",
  "OTHER",
] as const

export const serviceRequestPriorities = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "URGENT",
] as const

export const serviceRequestStatuses = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "IN_PROGRESS",
  "WAITING_FOR_USER",
  "COMPLETED",
  "REJECTED",
] as const

export function requestCategoryLabel(category: string) {
  switch (category) {
    case "WEBSITE_DEVELOPMENT":
      return "Website Development"
    case "MOBILE_APP_DEVELOPMENT":
      return "Mobile App Development"
    case "AI_SOLUTION":
      return "AI Solution"
    case "SAAS_PLATFORM":
      return "SaaS Platform"
    case "UI_UX_DESIGN":
      return "UI/UX Design"
    case "TECHNICAL_SUPPORT":
      return "Technical Support"
    default:
      return "Other"
  }
}

export function requestPriorityLabel(priority: string) {
  switch (priority) {
    case "LOW":
      return "Low"
    case "MEDIUM":
      return "Medium"
    case "HIGH":
      return "High"
    case "URGENT":
      return "Urgent"
    default:
      return priority
  }
}

export function requestStatusLabel(status: string) {
  switch (status) {
    case "SUBMITTED":
      return "Submitted"
    case "UNDER_REVIEW":
      return "Under Review"
    case "IN_PROGRESS":
      return "In Progress"
    case "WAITING_FOR_USER":
      return "Waiting for User"
    case "COMPLETED":
      return "Completed"
    case "REJECTED":
      return "Rejected"
    case "PENDING":
      return "Submitted"
    case "IN_REVIEW":
      return "Under Review"
    case "APPROVED":
      return "In Progress"
    default:
      return status
  }
}

