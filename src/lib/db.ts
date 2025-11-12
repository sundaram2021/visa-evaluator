// Mock MongoDB interface - replace with actual MongoDB client
const evaluations: any[] = []

export async function storeEvaluation(data: any) {
  const id = `eval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const evaluation = { id, ...data }
  evaluations.push(evaluation)

  // In production, this would be:
  // const result = await db.evaluations.insertOne(evaluation)
  // return { id: result.insertedId.toString(), ...evaluation }

  return evaluation
}

export async function getEvaluationsByPartnerKey(partnerKey: string) {
  // In production, filter by partner_key
  return evaluations.filter((e) => e.partner_key === partnerKey)
}

export async function getEvaluationById(id: string) {
  return evaluations.find((e) => e.id === id)
}

export function getEvaluations() {
  return evaluations
}

export function getAllEvaluations() {
  return evaluations
}
