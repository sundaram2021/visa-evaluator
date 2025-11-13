"use client"

import { useLanguage } from "@/hooks/use-language"

export function Header() {
    const { t } = useLanguage()
    
    return (
        <header className="bg-linear-to-r from-white to-blue-50 border-b border-blue-100 py-8 px-4 shadow-sm">
            <div className="container mx-auto max-w-6xl">
                <div className="inline-flex items-center gap-2 mb-4 px-4 py-1 bg-blue-100 rounded-full">
                    <span className="text-lg">🌐</span>
                    <span className="text-sm font-semibold text-blue-700">{t("home.badge")}</span>
                </div>
                <h1 className="text-5xl font-bold text-blue-600 text-balance mb-2">{t("home.title")}</h1>
                <p className="text-lg text-gray-600 max-w-2xl">
                    {t("home.subtitle")}
                </p>
            </div>
        </header>
    )
}
