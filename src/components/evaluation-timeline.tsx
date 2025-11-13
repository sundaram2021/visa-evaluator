"use client"

import { useEffect, useState } from "react"

interface Step {
    id: number
    text: string
    description: string
}

interface Event {
    t: number
    m: string
}

export function EvaluationTimeline({ running, events = [] }: { running: boolean; events?: Event[] }) {
    const steps: Step[] = [
        {
            id: 1,
            text: "Receiving documents",
            description: "Uploading and processing your files..."
        },
        {
            id: 2,
            text: "Validating document format & clarity",
            description: "Checking document quality and readability..."
        },
        {
            id: 3,
            text: "Running document verification with agent",
            description: "AI agent analyzing document contents..."
        },
        {
            id: 4,
            text: "Computing visa eligibility score",
            description: "Calculating your eligibility metrics..."
        },
        {
            id: 5,
            text: "Generating report & sending email",
            description: "Finalizing your results..."
        },
    ]

    const [active, setActive] = useState(0)
    const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())

    const mapEventToStep = (message: string) => {
        const m = message.toLowerCase()
        if (m.includes("received") || m.includes("started") || m.includes("uploaded")) return 1
        if (m.includes("ocr") || m.includes("validated") || m.includes("format") || m.includes("clarity")) return 2
        if (m.includes("agent") || m.includes("verifying") || m.includes("analyzing")) return 3
        if (m.includes("scored") || m.includes("score") || m.includes("eligibility")) return 4
        if (m.includes("pdf") || m.includes("email") || m.includes("finished") || m.includes("sent") || m.includes("report")) return 5
        return 0
    }

    // Get relevant events for a specific step
    const getStepEvents = (stepId: number) => {
        return events.filter(e => {
            const step = mapEventToStep(e.m)
            return step === stepId
        }).slice(-3) // Show only last 3 events per step
    }

    useEffect(() => {
        if (!running) {
            const t = setTimeout(() => {
                setActive(0)
                setCompletedSteps(new Set())
            }, 50)
            return () => clearTimeout(t)
        }

        if (events && events.length > 0) {
            // Compute both states together, then update in a single batched operation
            const completed = new Set<number>()
            let maxStep = 0

            events.forEach(event => {
                const step = mapEventToStep(event.m)
                if (step > 0) {
                    maxStep = Math.max(maxStep, step)
                    if (step < maxStep) {
                        completed.add(step)
                    }
                }
            })

            // Use a microtask to batch the updates together
            Promise.resolve().then(() => {
                setCompletedSteps(completed)
                setActive(maxStep)
            })
            return
        }

        // Fallback animation
        let mounted = true
        let i = 0
        const tick = () => {
            if (!mounted) return
            i = Math.min(i + 1, steps.length)
            setActive(i)
            if (i > 1) {
                setCompletedSteps(prev => new Set([...prev, i - 1]))
            }
            if (i < steps.length) {
                setTimeout(tick, 1200 + Math.random() * 800)
            }
        }

        const startTimer = setTimeout(tick, 500)
        return () => {
            mounted = false
            clearTimeout(startTimer)
        }
    }, [running, events, steps.length])

    const getStepStatus = (stepId: number) => {
        if (completedSteps.has(stepId)) return "completed"
        if (stepId === active) return "active"
        if (stepId < active) return "active"
        return "pending"
    }

    return (
        <div className="w-full max-w-4xl mx-auto p-6 bg-linear-to-br from-slate-50 to-slate-100 rounded-xl shadow-lg">
            <div className="mb-6">
                <h3 className="text-2xl font-bold text-slate-800 mb-2">AI Evaluation in Progress</h3>
                <p className="text-slate-600 text-sm">Processing your visa application documents...</p>
            </div>

            <div className="space-y-4">
                {steps.map((step, idx) => {
                    const stepNum = idx + 1
                    const status = getStepStatus(stepNum)
                    const stepEvents = getStepEvents(stepNum)
                    const isExpanded = status === "active" || (status === "completed" && stepEvents.length > 0)

                    return (
                        <div
                            key={step.id}
                            className={`relative rounded-lg border-2 transition-all duration-500 ${status === "active"
                                    ? "bg-white border-blue-500 shadow-lg scale-[1.02]"
                                    : status === "completed"
                                        ? "bg-white border-green-500"
                                        : "bg-white/50 border-slate-200"
                                }`}
                        >
                            <div className="p-4">
                                <div className="flex items-start gap-4">
                                    {/* Step Icon */}
                                    <div className="shrink-0">
                                        <div
                                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${status === "completed"
                                                    ? "bg-green-500 text-white"
                                                    : status === "active"
                                                        ? "bg-blue-500 text-white animate-pulse"
                                                        : "bg-slate-200 text-slate-500"
                                                }`}
                                        >
                                            {status === "completed" ? (
                                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            ) : (
                                                stepNum
                                            )}
                                        </div>
                                    </div>

                                    {/* Step Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h4
                                                className={`font-semibold text-base ${status === "pending" ? "text-slate-500" : "text-slate-800"
                                                    }`}
                                            >
                                                {step.text}
                                            </h4>
                                            {status === "active" && (
                                                <span className="flex items-center gap-1 text-xs text-blue-600 font-medium">
                                                    <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
                                                    Processing
                                                </span>
                                            )}
                                            {status === "completed" && (
                                                <span className="text-xs text-green-600 font-medium">Completed</span>
                                            )}
                                        </div>

                                        <p className={`text-sm mb-2 ${status === "pending" ? "text-slate-400" : "text-slate-600"}`}>
                                            {step.description}
                                        </p>

                                        {/* Progress Bar */}
                                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-700 ease-out ${status === "completed"
                                                        ? "bg-green-500 w-full"
                                                        : status === "active"
                                                            ? "bg-blue-500 w-3/4 animate-pulse"
                                                            : "bg-slate-200 w-0"
                                                    }`}
                                            />
                                        </div>

                                        {/* Live Events */}
                                        {isExpanded && stepEvents.length > 0 && (
                                            <div className="mt-3 space-y-1 animate-in fade-in slide-in-from-top-2 duration-500">
                                                {stepEvents.map((event, i) => (
                                                    <div
                                                        key={i}
                                                        className="flex items-start gap-2 text-xs text-slate-600 bg-slate-50 rounded px-3 py-2"
                                                    >
                                                        <span className="text-slate-400 font-mono shrink-0">
                                                            {new Date(event.t).toLocaleTimeString()}
                                                        </span>
                                                        <span className="flex-1">{event.m}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Overall Progress */}
            <div className="mt-6 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 font-medium">Overall Progress</span>
                    <span className="text-slate-800 font-bold">{Math.round((active / steps.length) * 100)}%</span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden mt-2">
                    <div
                        className="h-full bg-linear-to-r from-blue-500 to-blue-600 transition-all duration-700 ease-out"
                        style={{ width: `${(active / steps.length) * 100}%` }}
                    />
                </div>
            </div>
        </div>
    )
}

export default EvaluationTimeline