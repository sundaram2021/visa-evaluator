import { NextResponse } from "next/server"
import { getJob, type JobEvent } from "@/lib/job-manager"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const jobId = url.searchParams.get("jobId")
  if (!jobId) return NextResponse.json({ error: "missing_jobId" }, { status: 400 })

  const job = getJob(jobId)
  if (!job) return NextResponse.json({ error: "job_not_found" }, { status: 404 })

  // Verify job has the on method (it should extend EventEmitter)
  if (typeof job.on !== "function") {
    console.error("Job object does not have 'on' method:", job)
    return NextResponse.json({ error: "job_invalid" }, { status: 500 })
  }

  const stream = new ReadableStream({
    start(controller) {
      const onProgress = (ev: JobEvent) => {
        try {
          const data = JSON.stringify(ev)
          controller.enqueue(encodeString(`data: ${data}\n\n`))
        } catch {
          // ignore
        }
      }

      job.on("progress", onProgress)

      // teardown when client disconnects
      const signal = request.signal
      signal.addEventListener("abort", () => {
        job.off("progress", onProgress)
        controller.close()
      })
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}

function encodeString(s: string) {
  return new TextEncoder().encode(s)
}
