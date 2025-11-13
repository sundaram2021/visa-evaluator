import { EventEmitter } from "events"

export type JobEvent = { type: string; payload?: unknown }

export class Job extends EventEmitter {
  id: string
  status: string
  constructor(id: string) {
    super()
    this.setMaxListeners(0) // Allow unlimited listeners for progress tracking
    this.id = id
    this.status = "pending"
  }

  emitProgress(type: string, payload?: unknown) {
    const ev: JobEvent = { type, payload }
    this.emit("progress", ev)
  }
}

// Store jobs map on globalThis so that multiple module instances (dev server hot reloads)
// share the same registry. This avoids cases where getJob returns an object from a
// different module instance and EventEmitter methods are missing/duplicated.
const g = globalThis as unknown as { __evaluation_jobs?: Map<string, Job> }
if (!g.__evaluation_jobs) g.__evaluation_jobs = new Map<string, Job>()
const jobs: Map<string, Job> = g.__evaluation_jobs!

export function createJob() {
  const id = `job_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
  const job = new Job(id)
  jobs.set(id, job)
  return job
}

export function getJob(id: string) {
  return jobs.get(id) as Job | undefined
}

export function removeJob(id: string) {
  jobs.delete(id)
}

// Convenience helpers to subscribe/unsubscribe in case some runtimes prefer
// going through the manager rather than calling .on/.off directly.
export function subscribeJobProgress(id: string, listener: (ev: JobEvent) => void) {
  const job = getJob(id)
  if (!job) return false
  job.on("progress", listener)
  return true
}

export function unsubscribeJobProgress(id: string, listener: (ev: JobEvent) => void) {
  const job = getJob(id)
  if (!job) return false
  job.off("progress", listener)
  return true
}

const api = { createJob, getJob, removeJob, subscribeJobProgress, unsubscribeJobProgress }
export default api
