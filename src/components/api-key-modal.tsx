"use client"

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Copy, Check } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"

interface ApiKeyModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    jobId: string
}

export function ApiKeyModal({ open, onOpenChange, jobId }: ApiKeyModalProps) {
    const { t } = useLanguage()
    const [apiKey, setApiKey] = useState<string>("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string>("")
    const [copiedKey, setCopiedKey] = useState(false)
    const [copiedCurl, setCopiedCurl] = useState(false)

    const generateApiKey = async () => {
        setLoading(true)
        setError("")
        try {
            const response = await fetch("/api/partner/generate-key", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ jobId }),
            })

            if (!response.ok) {
                throw new Error("Failed to generate API key")
            }

            const data = await response.json()
            setApiKey(data.apiKey)
        } catch (err) {
            setError(t("api.failed"))
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const copyToClipboard = async (text: string, type: "key" | "curl") => {
        try {
            await navigator.clipboard.writeText(text)
            if (type === "key") {
                setCopiedKey(true)
                setTimeout(() => setCopiedKey(false), 2000)
            } else {
                setCopiedCurl(true)
                setTimeout(() => setCopiedCurl(false), 2000)
            }
        } catch (err) {
            console.error("Failed to copy:", err)
        }
    }

    const curlCommand = apiKey
        ? `curl "${typeof window !== 'undefined' ? window.location.origin : ''}/api/partner?apiKey=${apiKey}"`
        : ""

    // Generate API key when modal opens if not already generated
    if (open && !apiKey && !loading && !error) {
        generateApiKey()
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{t("api.title")}</DialogTitle>
                    <DialogDescription>
                        {t("api.description")}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {loading && (
                        <div className="text-center py-4">
                            <p className="text-muted-foreground">{t("api.generating")}</p>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-4">
                            <p className="text-sm text-red-600">{error}</p>
                            <Button
                                onClick={generateApiKey}
                                variant="outline"
                                className="mt-2"
                                size="sm"
                            >
                                {t("api.retry")}
                            </Button>
                        </div>
                    )}

                    {apiKey && (
                        <>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t("api.yourKey")}</label>
                                <div className="flex gap-2">
                                    <Input
                                        value={apiKey}
                                        readOnly
                                        className="font-mono text-sm"
                                    />
                                    <Button
                                        size="icon"
                                        variant="outline"
                                        onClick={() => copyToClipboard(apiKey, "key")}
                                    >
                                        {copiedKey ? (
                                            <Check className="h-4 w-4" />
                                        ) : (
                                            <Copy className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {t("api.keepSecure")}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t("api.curlLabel")}</label>
                                <div className="flex gap-2">
                                    <Input
                                        value={curlCommand}
                                        readOnly
                                        className="font-mono text-xs"
                                    />
                                    <Button
                                        size="icon"
                                        variant="outline"
                                        onClick={() => copyToClipboard(curlCommand, "curl")}
                                    >
                                        {copiedCurl ? (
                                            <Check className="h-4 w-4" />
                                        ) : (
                                            <Copy className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {t("api.curlHelp")}
                                </p>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                                <h4 className="text-sm font-semibold mb-2">{t("api.endpoint")}</h4>
                                <code className="text-xs block bg-white p-2 rounded border">
                                    GET /api/partner?apiKey=YOUR_API_KEY
                                </code>
                            </div>
                        </>
                    )}
                </div>

                <div className="flex justify-end">
                    <Button onClick={() => onOpenChange(false)}>{t("api.close")}</Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
