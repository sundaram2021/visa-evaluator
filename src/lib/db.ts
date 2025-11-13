import { MongoClient, ObjectId } from "mongodb"

const MONGO_URI = process.env.MONGO_URI

if (!MONGO_URI) {
  throw new Error("MONGO_URI must be set in environment variables")
}

declare global {
  // eslint-disable-next-line no-var
  var __mongoClient: MongoClient | undefined
}

function getClient(): MongoClient {
  if (global.__mongoClient) return global.__mongoClient
  const client = new MongoClient(MONGO_URI!)
  global.__mongoClient = client
  return client
}

async function getCollection() {
  const client = getClient()
  // ensure connection (connect() is idempotent)
  await client.connect()
  const db = client.db(process.env.MONGO_DB_NAME || "visa_evaluations")
  return db.collection("evaluations")
}

export async function storeEvaluation(data: any) {
  const col = await getCollection()
  const res = await col.insertOne({ ...data, createdAt: new Date() })
  const id = res.insertedId.toString()
  return { id, ...data }
}

export async function getEvaluationsByPartnerKey(partnerKey: string) {
  const col = await getCollection()
  return col.find({ partner_key: partnerKey }).toArray()
}

export async function getEvaluationById(id: string) {
  try {
    const col = await getCollection()
    const doc = await col.findOne({ _id: new ObjectId(id) })
    if (!doc) return null
    const { _id, ...rest } = doc
    return { id: _id.toString(), ...rest } as any
  } catch (e) {
    // try fallback if id stored as string field
    const col = await getCollection()
    const doc = await col.findOne({ id })
    if (!doc) return null
    const { _id, ...rest } = doc
    return { id: _id?.toString() || doc.id, ...rest } as any
  }
}

export async function getEvaluations() {
  const col = await getCollection()
  return col.find().toArray()
}

export async function getAllEvaluations() {
  return getEvaluations()
}

export async function updateEvaluationApiKey(id: string, apiKey: string) {
  try {
    const col = await getCollection()
    await col.updateOne(
      { _id: new ObjectId(id) },
      { $set: { apiKey, apiKeyCreatedAt: new Date() } }
    )
    return true
  } catch (e) {
    console.error("Error updating API key:", e)
    return false
  }
}

export async function getEvaluationByApiKey(apiKey: string) {
  const col = await getCollection()
  const doc = await col.findOne({ apiKey })
  if (!doc) return null
  const { _id, ...rest } = doc
  return { id: _id.toString(), ...rest } as any
}
