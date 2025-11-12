"use client"

import { useRef, useState } from "react"
import { EvaluationForm } from "@/components/evaluation-form"
import { ResultsDisplay } from "@/components/results-display"
// import { Header } from "@/components/header"
import { LanguageSwitcher } from "@/components/language-switcher"
import { Shield, TrendingUp, FileCheck, Globe } from "lucide-react"
import { useLanguage } from "@/hooks/use-language" // Import useLanguage hook

export default function Home() {
  const [results, setResults] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const formRef = useRef<HTMLDivElement>(null)
  const { t } = useLanguage() // Use useLanguage hook

  const handleSubmitEvaluation = async (formData: any) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error("Error submitting evaluation:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <main className="min-h-screen bg-background">
      {/* <Header /> */}
      <LanguageSwitcher />

      {!results ? (
        <>
          {/* Hero Section */}
          <section className="relative bg-gradient-to-br from-blue-50 to-white py-20 px-4 md:py-32">
            <div className="container mx-auto max-w-6xl text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 mb-6">
                <Globe className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">{t("home.badge")}</span>
              </div>

              {/* Main Title */}
              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight text-balance">
                {t("home.title")}
              </h1>

              {/* Subtitle */}
              <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto text-balance">
                {t("home.subtitle")}
              </p>

              {/* CTA Button */}
              <button
                onClick={scrollToForm}
                className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl text-lg"
              >
                {t("home.cta")}
              </button>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <Shield className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                  <p className="text-3xl font-bold text-foreground">{t("home.stat1.value")}</p>
                  <p className="text-sm text-muted-foreground">{t("home.stat1.label")}</p>
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                  <p className="text-3xl font-bold text-foreground">{t("home.stat2.value")}</p>
                  <p className="text-sm text-muted-foreground">{t("home.stat2.label")}</p>
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <FileCheck className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                  <p className="text-3xl font-bold text-foreground">{t("home.stat3.value")}</p>
                  <p className="text-sm text-muted-foreground">{t("home.stat3.label")}</p>
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <Globe className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                  <p className="text-3xl font-bold text-foreground">{t("home.stat4.value")}</p>
                  <p className="text-sm text-muted-foreground">{t("home.stat4.label")}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Evaluation Form Section */}
          <section ref={formRef} className="py-16 px-4 bg-gray-50">
            <div className="container mx-auto max-w-4xl">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{t("home.form.title")}</h2>
                <p className="text-lg text-muted-foreground">{t("home.form.subtitle")}</p>
              </div>
              <EvaluationForm onSubmit={handleSubmitEvaluation} isLoading={isLoading} />
            </div>
          </section>
        </>
      ) : (
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <ResultsDisplay results={results} />
            <button
              onClick={() => setResults(null)}
              className="mt-8 w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t("results.another")}
            </button>
          </div>
        </section>
      )}
    </main>
  )
}
