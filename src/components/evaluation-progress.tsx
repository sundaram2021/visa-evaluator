"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import EvaluationTimeline from "@/components/evaluation-timeline"
import { ResultsDisplay } from "@/components/results-display"
import { useLanguage } from "@/hooks/use-language"

type EvalResult = {
    id?: string
    score: number
    summary: string
    strengths: string[]
    improvements: string[]
    recommendation: string
    evaluationId?: string
    name?: string
    email?: string
    country?: string
    visaType?: string
    nextSteps?: string[]
    timeline?: string
    additionalNotes?: string
}

export default function EvaluationProgress({ jobId }: { jobId: string }) {
    const router = useRouter()
    const { t } = useLanguage()
    const [events, setEvents] = useState<{ t: number; m: string }[]>([])
    const [finalEvaluation, setFinalEvaluation] = useState<EvalResult | null>(null)
    const [status, setStatus] = useState<"running" | "failed" | "finished" | "idle">("idle")

    useEffect(() => {
        if (!jobId) return
        setTimeout(() => setStatus("running"), 0)

        const es = new EventSource(`/api/evaluate/events?jobId=${encodeURIComponent(jobId)}`)

        es.onmessage = (ev) => {
            try {
                const parsed = JSON.parse(ev.data)
                const type = parsed.type || "event"
                const payload = parsed.payload || {}
                const message = `${type}: ${payload?.message ? payload.message : JSON.stringify(payload)}`
                setEvents((p) => [...p, { t: Date.now(), m: message }])

                if (type === "invalid_documents") {
                    setStatus("failed")
                    es.close()
                }

                if (type === "finished") {
                    es.close()
                    if (payload?.ok && payload?.evaluationId) {
                        fetch(`/api/evaluate/result?evaluationId=${encodeURIComponent(payload.evaluationId)}`)
                            .then((r) => r.json())
                            .then((data) => {
                                const mapped: EvalResult = {
                                    id: data.id,
                                    evaluationId: data.id,
                                    score: data.score,
                                    summary: data.summary,
                                    strengths: data.strengths || [],
                                    improvements: data.improvements || [],
                                    recommendation: data.recommendation,
                                    name: data.name,
                                    email: data.email,
                                    country: data.country,
                                    visaType: data.visaType,
                                    nextSteps: data.nextSteps || [],
                                    timeline: data.timeline,
                                    additionalNotes: data.additionalNotes,
                                }
                                setFinalEvaluation(mapped)
                                setStatus("finished")
                            })
                            .catch(() => {
                                setStatus("failed")
                            })
                    } else {
                        setStatus("failed")
                    }
                }
            } catch {
                // ignore parse errors
            }
        }

        es.onerror = () => {
            setEvents((p) => [...p, { t: Date.now(), m: "Connection error to server events" }])
            setStatus("failed")
            es.close()
        }

        return () => es.close()
    }, [jobId])

    return (
        <main className="min-h-screen bg-background py-12">
            <div className="container mx-auto max-w-4xl">
                {status !== "finished" && <h1 className="text-2xl font-bold mb-6">{t("evaluation.progressTitle")}</h1>}

                {status === "running" && (
                    <div className="grid grid-cols-1 gap-6">
                        <EvaluationTimeline running={true} events={events} />
                    </div>
                )}

                {status === "failed" && (
                    <div className="bg-red-50 border border-red-200 rounded p-6">
                        <h2 className="text-xl font-bold mb-2">{t("evaluation.failedTitle")}</h2>
                        <p className="mb-4">{t("evaluation.failedMsg")}</p>
                        <div className="flex gap-3">
                            <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={() => router.push("/")}>{t("evaluation.backHome")}</button>
                        </div>
                    </div>
                )}

                {status === "finished" && finalEvaluation && (
                    <div>
                        <ResultsDisplay results={{
                            id: finalEvaluation.id || finalEvaluation.evaluationId || "",
                            evaluationId: finalEvaluation.evaluationId || finalEvaluation.id || "",
                            score: finalEvaluation.score,
                            summary: finalEvaluation.summary,
                            strengths: finalEvaluation.strengths,
                            improvements: finalEvaluation.improvements,
                            recommendation: finalEvaluation.recommendation,
                            name: finalEvaluation.name,
                            email: finalEvaluation.email,
                            country: finalEvaluation.country,
                            visaType: finalEvaluation.visaType,
                            nextSteps: finalEvaluation.nextSteps,
                            timeline: finalEvaluation.timeline,
                            additionalNotes: finalEvaluation.additionalNotes,
                        }} />
                        <div className="mt-6">
                            <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={() => router.push("/")}>{t("evaluation.returnHome")}</button>
                        </div>
                    </div>
                )}
            </div>
        </main>
    )
}
