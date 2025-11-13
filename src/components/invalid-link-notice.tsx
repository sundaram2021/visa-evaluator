"use client"

import { useLanguage } from "@/hooks/use-language"

export function InvalidLinkNotice() {
    const { t } = useLanguage()
    return (
        <main className="min-h-screen bg-background py-12">
            <div className="container mx-auto max-w-2xl">
                <div className="bg-yellow-50 border border-yellow-200 rounded p-6">
                    <h2 className="text-xl font-bold mb-2">{t("evaluation.invalidLink")}</h2>
                    <p className="mb-1">{t("evaluation.notFound")}</p>
                    <p className="text-sm text-muted-foreground">{t("evaluation.ensureValid")}</p>
                </div>
            </div>
        </main>
    )
}
