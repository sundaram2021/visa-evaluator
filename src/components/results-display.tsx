"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ApiKeyModal } from "@/components/api-key-modal"
import { useLanguage } from "@/hooks/use-language"
// import { translateText, shouldTranslateContent } from "@/lib/translate" // Uncomment when translation API is configured

interface ResultsProps {
    results: {
        id: string
        score: number
        summary: string
        strengths: string[]
        improvements: string[]
        recommendation: string
        evaluationId: string
        nextSteps?: string[]
        timeline?: string
        additionalNotes?: string
        name?: string
        email?: string
        country?: string
        visaType?: string
    }
    showEmbedPreview?: boolean
}

export function ResultsDisplay({ results, showEmbedPreview = true }: ResultsProps) {
    const router = useRouter()
    const { t } = useLanguage()
    const [copied, setCopied] = useState(false)
    const [downloading, setDownloading] = useState(false)
    const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false)

    console.log("ShowPreview:", showEmbedPreview)

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-green-600"
        if (score >= 65) return "text-blue-600"
        if (score >= 45) return "text-yellow-600"
        return "text-red-600"
    }

    const getScoreBgColor = (score: number) => {
        if (score >= 80) return "bg-green-50 border-green-200"
        if (score >= 65) return "bg-blue-50 border-blue-200"
        if (score >= 45) return "bg-yellow-50 border-yellow-200"
        return "bg-red-50 border-red-200"
    }

    const handleDownload = async () => {
        setDownloading(true)
        try {
            const response = await fetch(`/api/evaluate/result?evaluationId=${results.id}&format=pdf`)
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `Evaluation-${results.email || "report"}-o1.pdf`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
        } catch {
            alert(t("results.downloadFailed"))
        } finally {
            setDownloading(false)
        }
    }

    const handleCopyIframe = () => {
        const iframeCode = `<iframe src="${window.location.origin}/evaluation/${results.id}?embed=true" width="100%" height="800px" frameborder="0"></iframe>`
        navigator.clipboard.writeText(iframeCode)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleReset = () => {
        router.push("/")
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 p-4">
            {/* Header with Actions */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">{t("results.title")}</h2>
                <div className="flex gap-2 flex-wrap">
                    <Button onClick={handleDownload} disabled={downloading} variant="default" className="bg-blue-600 hover:bg-blue-700">
                        {downloading ? t("results.downloading") : `📥 ${t("results.downloadPdf")}`}
                    </Button>
                    <Button onClick={handleCopyIframe} variant="outline">
                        {copied ? `✓ ${t("results.copied")}` : `📋 ${t("results.copyIframe")}`}
                    </Button>
                    <Button onClick={() => setApiKeyModalOpen(true)} variant="outline" className="text-gray-700">
                        🔑 {t("results.apiKey")}
                    </Button>
                    <Button onClick={handleReset} variant="outline" className="text-gray-700">
                        🔄 {t("results.newEvaluation")}
                    </Button>
                </div>
            </div>

            {/* Score Card */}
            <Card className={`p-8 border-2 ${getScoreBgColor(results.score)}`}>
                <div className="text-center">
                    <div className="inline-block p-4 rounded-full bg-white/80 mb-4">
                        <div className={`text-5xl font-bold ${getScoreColor(results.score)}`}>{results.score}%</div>
                    </div>
                    <h3 className="text-2xl font-bold mb-2">{results.recommendation}</h3>
                    <p className="text-sm text-gray-600">
                        {results.name && `${results.name} • `}
                        {results.country && `${results.country} `}
                        {results.visaType && `${results.visaType}`}
                    </p>
                </div>
            </Card>

            {/* Summary */}
            <Card className="p-6 border-l-4 border-blue-500">
                <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                    <span className="text-blue-600">📋</span> {t("results.summary")}
                </h3>
                {/* Note: Dynamic content (summary, strengths, improvements, etc.) can be translated
                    using the translateText utility when a translation API is configured */}
                <p className="text-gray-700 leading-relaxed">{results.summary}</p>
                {results.timeline && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <span className="font-semibold text-blue-900">⏱️ {t("results.timeline")}:</span>{" "}
                        <span className="text-blue-700">{results.timeline}</span>
                    </div>
                )}
            </Card>

            {/* Strengths and Improvements Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6 border-l-4 border-green-500">
                    <h3 className="text-lg font-bold mb-4 text-green-700 flex items-center gap-2">
                        <span>✅</span> {t("results.strengths")}
                    </h3>
                    <ul className="space-y-3">
                        {results.strengths.map((strength, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm">
                                <span className="text-green-600 font-bold mt-0.5">{i + 1}.</span>
                                <span className="text-gray-700">{strength}</span>
                            </li>
                        ))}
                    </ul>
                </Card>

                <Card className="p-6 border-l-4 border-orange-500">
                    <h3 className="text-lg font-bold mb-4 text-orange-700 flex items-center gap-2">
                        <span>⚠️</span> {t("results.improvements")}
                    </h3>
                    <ul className="space-y-3">
                        {results.improvements.map((improvement, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm">
                                <span className="text-orange-600 font-bold mt-0.5">{i + 1}.</span>
                                <span className="text-gray-700">{improvement}</span>
                            </li>
                        ))}
                    </ul>
                </Card>
            </div>

            {/* Next Steps */}
            {results.nextSteps && results.nextSteps.length > 0 && (
                <Card className="p-6 border-l-4 border-purple-500">
                    <h3 className="text-lg font-bold mb-4 text-purple-700 flex items-center gap-2">
                        <span>🎯</span> {t("results.nextSteps")}
                    </h3>
                    <ol className="space-y-3">
                        {results.nextSteps.map((step, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm">
                                <span className="text-purple-600 font-bold bg-purple-100 rounded-full w-6 h-6 flex items-center justify-center shrink-0">
                                    {i + 1}
                                </span>
                                <span className="text-gray-700 pt-0.5">{step}</span>
                            </li>
                        ))}
                    </ol>
                </Card>
            )}

            {/* Additional Notes */}
            {results.additionalNotes && (
                <Card className="p-6 bg-gray-50 border-gray-200">
                    <h3 className="text-sm font-bold mb-2 text-gray-700 flex items-center gap-2">
                        <span>💡</span> {t("results.additionalNotes")}
                    </h3>
                    <p className="text-sm text-gray-600">{results.additionalNotes}</p>
                </Card>
            )}

            {/* Footer */}
            <Card className="p-4 bg-white border-gray-300">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
                    <p className="text-gray-900">
                        {t("results.evaluationIdLabel")} <span className="font-mono font-semibold text-blue-600">{results.id}</span>
                    </p>
                    <p className="text-gray-600 text-xs">
                        📧 {t("results.emailCopyNotice")}
                    </p>
                </div>
            </Card>

            {/* Disclaimer */}
            <div className="text-center text-xs text-gray-500 pt-4 border-t">
                <p>{t("results.disclaimer1")}</p>
                <p>{t("results.disclaimer2")}</p>
            </div>

            {/* Iframe Preview */}
            {/* {showEmbedPreview && (
                <div className="mt-8">
                    <Card className="p-6 bg-gray-50">
                        <h3 className="text-lg font-bold mb-4 text-gray-900">Embed Preview</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            This is how the report will appear when embedded on your website
                        </p>
                        <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-white">
                            <iframe 
                                src={`/evaluation/${results.id}?embed=true`} 
                                width="100%" 
                                height="800px" 
                                frameBorder="0"
                                title={`Evaluation Report - ${results.name || results.email || results.id}`}
                                className="w-full"
                            />
                        </div>
                    </Card>
                </div>
            )} */}

            {/* API Key Modal */}
            <ApiKeyModal
                open={apiKeyModalOpen}
                onOpenChange={setApiKeyModalOpen}
                jobId={results.id}
            />
        </div>
    )
}