"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { useLanguage } from "@/hooks/use-language"
import { Copy, Check } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface Evaluation {
    id: string
    country: string
    visaType: string
    name: string
    email: string
    score: number
    timestamp: string
}

export default function PartnerDashboard() {
    const { t } = useLanguage()
    const [partnerId] = useState(() => Math.random().toString(36).substr(2, 9))
    const [apiKey, setApiKey] = useState<string | null>(null)
    const [evaluations, setEvaluations] = useState<Evaluation[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [copied, setCopied] = useState(false)
    const [filterCountry, setFilterCountry] = useState("")
    const [filterScoreMin, setFilterScoreMin] = useState("")
    const [filterScoreMax, setFilterScoreMax] = useState("")

    // Generate API key on mount
    useEffect(() => {
        const generateKey = async () => {
            try {
                const response = await fetch("/api/partner/auth", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        partnerId,
                        partnerName: "Partner Dashboard",
                    }),
                })
                const data = await response.json()
                setApiKey(data.apiKey)
            } catch (error) {
                console.error("Error generating API key:", error)
            }
        }
        generateKey()
    }, [partnerId])

    // Fetch evaluations with filters
    useEffect(() => {
        const fetchEvaluations = async () => {
            if (!apiKey) return

            setIsLoading(true)
            try {
                const params = new URLSearchParams()
                if (filterCountry) params.append("country", filterCountry)
                if (filterScoreMin) params.append("minScore", filterScoreMin)
                if (filterScoreMax) params.append("maxScore", filterScoreMax)

                const response = await fetch(`/api/partner/evaluations?${params}`, {
                    headers: { "x-api-key": apiKey },
                })
                const data = await response.json()
                setEvaluations(data.evaluations || [])
            } catch (error) {
                console.error("Error fetching evaluations:", error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchEvaluations()
    }, [apiKey, filterCountry, filterScoreMin, filterScoreMax])

    const copyToClipboard = () => {
        if (apiKey) {
            navigator.clipboard.writeText(apiKey)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    return (
        <main className="min-h-screen bg-background">
            <Header />
            <div className="container mx-auto px-4 py-12 max-w-6xl">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-4xl font-bold text-foreground mb-2">{t("dashboard.title")}</h1>
                    <p className="text-muted-foreground">Access evaluations data via secure API</p>
                </div>

                {/* API Key Section */}
                <Card className="p-8 mb-8 border-0 shadow-lg">
                    <h2 className="text-2xl font-bold text-foreground mb-4">{t("dashboard.apiKey")}</h2>
                    <div className="flex gap-2">
                        <Input type="password" value={apiKey || ""} readOnly className="font-mono text-sm" />
                        <Button onClick={copyToClipboard} disabled={!apiKey}>
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            {copied ? "Copied" : "Copy"}
                        </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-3">
                        Use this key in the x-api-key header to access your evaluations data
                    </p>
                </Card>

                {/* Filters */}
                <Card className="p-6 mb-8 border-0 shadow-md">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Filters</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-sm font-medium text-foreground block mb-2">{t("dashboard.filter.country")}</label>
                            <Input
                                placeholder="Enter country"
                                value={filterCountry}
                                onChange={(e) => setFilterCountry(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-foreground block mb-2">Min Score</label>
                            <Input
                                type="number"
                                placeholder="0"
                                value={filterScoreMin}
                                onChange={(e) => setFilterScoreMin(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-foreground block mb-2">Max Score</label>
                            <Input
                                type="number"
                                placeholder="100"
                                value={filterScoreMax}
                                onChange={(e) => setFilterScoreMax(e.target.value)}
                            />
                        </div>
                    </div>
                </Card>

                {/* Evaluations Table */}
                <Card className="p-6 border-0 shadow-lg overflow-x-auto">
                    {isLoading ? (
                        <p className="text-center text-muted-foreground py-8">Loading...</p>
                    ) : evaluations.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">{t("dashboard.noResults")}</p>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left py-3 px-4 font-semibold text-foreground">{t("dashboard.column.date")}</th>
                                    <th className="text-left py-3 px-4 font-semibold text-foreground">{t("dashboard.column.name")}</th>
                                    <th className="text-left py-3 px-4 font-semibold text-foreground">{t("dashboard.column.country")}</th>
                                    <th className="text-left py-3 px-4 font-semibold text-foreground">{t("dashboard.column.visa")}</th>
                                    <th className="text-left py-3 px-4 font-semibold text-foreground">{t("dashboard.column.score")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {evaluations.map((evaluation) => (
                                    <tr key={evaluation.id} className="border-b border-border hover:bg-gray-50 transition-colors">
                                        <td className="py-3 px-4 text-muted-foreground">
                                            {new Date(evaluation.timestamp).toLocaleDateString()}
                                        </td>
                                        <td className="py-3 px-4 font-medium text-foreground">{evaluation.name}</td>
                                        <td className="py-3 px-4 text-foreground">{evaluation.country}</td>
                                        <td className="py-3 px-4 text-foreground">{evaluation.visaType}</td>
                                        <td className="py-3 px-4">
                                            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full font-bold text-white bg-blue-600">
                                                {evaluation.score}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </Card>
            </div>
        </main>
    )
}
