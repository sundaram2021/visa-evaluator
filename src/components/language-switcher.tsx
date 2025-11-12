"use client"

import { useLanguage } from "@/hooks/use-language"
import { LANGUAGES } from "@/lib/i18n"
import { Globe } from "lucide-react"
import { useState } from "react"

export function LanguageSwitcher() {
    const { language, setLanguage } = useLanguage()
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="fixed top-4 right-4 z-50">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-md"
            >
                <Globe className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">{LANGUAGES[language as keyof typeof LANGUAGES]?.name || "English"}</span>
            </button>

            {isOpen && (
                <div className="absolute top-12 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-2 w-48">
                    {Object.entries(LANGUAGES).map(([code, lang]) => {
                        const langCode = code as keyof typeof LANGUAGES
                        return (
                            <button
                                key={code}
                                onClick={() => {
                                    setLanguage(langCode)
                                    setIsOpen(false)
                                }}
                                className={`w-full text-left px-4 py-2 rounded transition-colors ${language === langCode ? "bg-blue-100 text-blue-700 font-medium" : "hover:bg-gray-100"
                                    }`}
                            >
                                {lang.name}
                            </button>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
