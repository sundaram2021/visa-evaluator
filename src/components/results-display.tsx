"use client"

import { Card } from "@/components/ui/card"

interface ResultsProps {
    results: {
        score: number
        summary: string
        strengths: string[]
        improvements: string[]
        recommendation: string
        evaluationId: string
    }
}

export function ResultsDisplay({ results }: ResultsProps) {
    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-green-600"
        if (score >= 60) return "text-blue-600"
        if (score >= 40) return "text-yellow-600"
        return "text-red-600"
    }

    const getScoreBgColor = (score: number) => {
        if (score >= 80) return "bg-green-50"
        if (score >= 60) return "bg-blue-50"
        if (score >= 40) return "bg-yellow-50"
        return "bg-red-50"
    }

    return (
        <div className="space-y-6">
            <Card className={`p-8 ${getScoreBgColor(results.score)}`}>
                <div className="text-center">
                    <p className="text-sm font-medium text-muted-foreground mb-2">Visa Eligibility Score</p>
                    <div className={`text-6xl font-bold ${getScoreColor(results.score)} mb-4`}>{results.score}%</div>
                    <p className="text-lg font-medium">{results.recommendation}</p>
                </div>
            </Card>

            <Card className="p-6">
                <h3 className="text-xl font-bold mb-3">Summary</h3>
                <p className="text-foreground/80 leading-relaxed">{results.summary}</p>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-6 border-l-4 border-green-500">
                    <h3 className="text-lg font-bold mb-3 text-green-700">Strengths</h3>
                    <ul className="space-y-2">
                        {results.strengths.map((strength, i) => (
                            <li key={i} className="text-sm flex items-start gap-2">
                                <span className="text-green-600 mt-1">✓</span>
                                <span>{strength}</span>
                            </li>
                        ))}
                    </ul>
                </Card>

                <Card className="p-6 border-l-4 border-orange-500">
                    <h3 className="text-lg font-bold mb-3 text-orange-700">Areas for Improvement</h3>
                    <ul className="space-y-2">
                        {results.improvements.map((improvement, i) => (
                            <li key={i} className="text-sm flex items-start gap-2">
                                <span className="text-orange-600 mt-1">!</span>
                                <span>{improvement}</span>
                            </li>
                        ))}
                    </ul>
                </Card>
            </div>

            <Card className="p-4 bg-muted">
                <p className="text-xs text-muted-foreground">
                    Evaluation ID: <span className="font-mono">{results.evaluationId}</span>
                </p>
            </Card>
        </div>
    )
}
