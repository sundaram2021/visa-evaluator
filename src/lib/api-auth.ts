import { randomBytes } from "crypto"

export interface ApiKeyData {
  key: string
  partnerId: string
  partnerName: string
  createdAt: Date
  rateLimit: number
  requestsUsedToday: number
  isActive: boolean
}

// In-memory API key storage (replace with DB in production)
const apiKeys = new Map<string, ApiKeyData>()

export function generateApiKey(): string {
  return `vak_${randomBytes(32).toString("hex")}`
}

export function createApiKey(partnerId: string, partnerName: string): ApiKeyData {
  const key = generateApiKey()
  const apiKeyData: ApiKeyData = {
    key,
    partnerId,
    partnerName,
    createdAt: new Date(),
    rateLimit: 1000,
    requestsUsedToday: 0,
    isActive: true,
  }
  apiKeys.set(key, apiKeyData)
  return apiKeyData
}

export function verifyApiKey(key: string): ApiKeyData | null {
  const apiKeyData = apiKeys.get(key)
  if (!apiKeyData || !apiKeyData.isActive) {
    return null
  }

  // Check rate limit (reset daily)
  const now = new Date()
  const createdDate = new Date(apiKeyData.createdAt)
  if (now.getDate() !== createdDate.getDate()) {
    apiKeyData.requestsUsedToday = 0
  }

  if (apiKeyData.requestsUsedToday >= apiKeyData.rateLimit) {
    return null
  }

  apiKeyData.requestsUsedToday += 1
  return apiKeyData
}

export function getAllApiKeys(): ApiKeyData[] {
  return Array.from(apiKeys.values())
}

export function getApiKeyByPartnerId(partnerId: string): ApiKeyData | undefined {
  return Array.from(apiKeys.values()).find((k) => k.partnerId === partnerId)
}
