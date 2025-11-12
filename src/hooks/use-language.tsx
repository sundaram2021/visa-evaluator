"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

const translations = {
    en: {
        home: {
            badge: "AI-Powered Visa Assessment",
            title: "Your Visa Journey Starts Here",
            subtitle:
                "Get an instant evaluation of your visa eligibility with our advanced assessment tool. Know your chances before you apply.",
            cta: "Get Started",
            stat1: { value: "100%", label: "Secure & Private" },
            stat2: { value: "94%", label: "Success Rate" },
            stat3: { value: "50K+", label: "Evaluations" },
            stat4: { value: "25+", label: "Countries" },
            form: {
                title: "Start Your Evaluation",
                subtitle: "Fill in your details to receive an instant visa eligibility assessment",
            },
        },
        results: { another: "Start Another Evaluation" },
    },
    es: {
        home: {
            badge: "Evaluación de Visa Impulsada por IA",
            title: "Tu Viaje de Visa Comienza Aquí",
            subtitle:
                "Obtén una evaluación instantánea de tu elegibilidad de visa con nuestra herramienta de evaluación avanzada. Conoce tus posibilidades antes de solicitar.",
            cta: "Comenzar",
            stat1: { value: "100%", label: "Seguro y Privado" },
            stat2: { value: "94%", label: "Tasa de Éxito" },
            stat3: { value: "50K+", label: "Evaluaciones" },
            stat4: { value: "25+", label: "Países" },
            form: {
                title: "Comienza Tu Evaluación",
                subtitle: "Completa tus detalles para recibir una evaluación de elegibilidad de visa instantánea",
            },
        },
        results: { another: "Comenzar Otra Evaluación" },
    },
    fr: {
        home: {
            badge: "Évaluation de Visa Alimentée par l'IA",
            title: "Votre Parcours Visa Commence Ici",
            subtitle:
                "Obtenez une évaluation instantanée de votre admissibilité aux visas avec notre outil d'évaluation avancé. Connaissez vos chances avant de postuler.",
            cta: "Commencer",
            stat1: { value: "100%", label: "Sécurisé et Privé" },
            stat2: { value: "94%", label: "Taux de Réussite" },
            stat3: { value: "50K+", label: "Évaluations" },
            stat4: { value: "25+", label: "Pays" },
            form: {
                title: "Commencez Votre Évaluation",
                subtitle: "Remplissez vos coordonnées pour recevoir une évaluation instantanée de l'admissibilité aux visas",
            },
        },
        results: { another: "Commencer une Autre Évaluation" },
    },
    de: {
        home: {
            badge: "KI-gestützte Visabewertung",
            title: "Ihre Visareise Beginnt Hier",
            subtitle:
                "Erhalten Sie eine sofortige Bewertung Ihrer Visa-Berechtigung mit unserem fortschrittlichen Bewertungstool. Kennen Sie Ihre Chancen, bevor Sie sich bewerben.",
            cta: "Beginnen",
            stat1: { value: "100%", label: "Sicher & Privat" },
            stat2: { value: "94%", label: "Erfolgsrate" },
            stat3: { value: "50K+", label: "Bewertungen" },
            stat4: { value: "25+", label: "Länder" },
            form: {
                title: "Starten Sie Ihre Bewertung",
                subtitle: "Füllen Sie Ihre Daten aus, um eine sofortige Visaberechtigung-Bewertung zu erhalten",
            },
        },
        results: { another: "Eine Weitere Bewertung Starten" },
    },
    pt: {
        home: {
            badge: "Avaliação de Visto Alimentada por IA",
            title: "Sua Jornada de Visto Começa Aqui",
            subtitle:
                "Obtenha uma avaliação instantânea de sua elegibilidade de visto com nossa ferramenta de avaliação avançada. Conhece suas chances antes de se candidatar.",
            cta: "Começar",
            stat1: { value: "100%", label: "Seguro e Privado" },
            stat2: { value: "94%", label: "Taxa de Sucesso" },
            stat3: { value: "50K+", label: "Avaliações" },
            stat4: { value: "25+", label: "Países" },
            form: {
                title: "Comece Sua Avaliação",
                subtitle: "Preencha seus detalhes para receber uma avaliação instantânea de elegibilidade de visto",
            },
        },
        results: { another: "Iniciar Outra Avaliação" },
    },
    ar: {
        home: {
            badge: "تقييم التأشيرة بقوة الذكاء الاصطناعي",
            title: "تبدأ رحلة التأشيرة الخاصة بك هنا",
            subtitle: "احصل على تقييم فوري لأهليتك للتأشيرة من خلال أداة التقييم المتقدمة لدينا. تعرف على فرصك قبل التقديم.",
            cta: "ابدأ",
            stat1: { value: "100%", label: "آمن وخاص" },
            stat2: { value: "94%", label: "معدل النجاح" },
            stat3: { value: "50K+", label: "التقييمات" },
            stat4: { value: "25+", label: "الدول" },
            form: { title: "ابدأ تقييمك", subtitle: "ملء التفاصيل الخاصة بك للحصول على تقييم أهلية التأشيرة الفوري" },
        },
        results: { another: "بدء تقييم آخر" },
    },
    zh: {
        home: {
            badge: "人工智能驱动的签证评估",
            title: "您的签证之旅从这里开始",
            subtitle: "使用我们先进的评估工具获得您的签证资格即时评估。在申请前了解您的机会。",
            cta: "开始",
            stat1: { value: "100%", label: "安全与隐私" },
            stat2: { value: "94%", label: "成功率" },
            stat3: { value: "50K+", label: "评估" },
            stat4: { value: "25+", label: "国家" },
            form: { title: "开始您的评估", subtitle: "填写您的详细信息以获得即时签证资格评估" },
        },
        results: { another: "开始另一项评估" },
    },
    ja: {
        home: {
            badge: "AI駆動のビザ評価",
            title: "あなたのビザジャーニーはここから始まります",
            subtitle:
                "当社の高度な評価ツールを使用して、ビザの適格性の即座評価を取得してください。申請する前にあなたのチャンスを知ってください。",
            cta: "始める",
            stat1: { value: "100%", label: "安全とプライバシー" },
            stat2: { value: "94%", label: "成功率" },
            stat3: { value: "50K+", label: "評価" },
            stat4: { value: "25+", label: "国" },
            form: {
                title: "あなたの評価を開始してください",
                subtitle: "詳細を入力して、即座のビザ適格性評価を受け取ってください",
            },
        },
        results: { another: "別の評価を開始する" },
    },
}

type Language = keyof typeof translations
type LanguageContextType = {
    language: Language
    setLanguage: (lang: Language) => void
    t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
    // Initialize to 'en' by default. This is a client component so it's
    // safe to read localStorage on initial render. Using the lazy
    // initializer avoids calling setState inside an effect.
    const [language, setLanguageState] = useState<Language>(() => {
        try {
            const saved = localStorage.getItem("language") as Language | null
            if (saved && saved in translations) return saved
        } catch {
            /* ignore (e.g. private mode) */
        }
        return "en"
    })

    const setLanguage = (lang: Language) => {
        if (lang in translations) {
            setLanguageState(lang)
            localStorage.setItem("language", lang)
        }
    }

    const t = (key: string): string => {
        const keys = key.split(".")
        let value: unknown = translations[language]
        for (const k of keys) {
            // value may be nested objects, treat as a record for indexing
            value = (value as Record<string, unknown> | undefined)?.[k]
        }
        return typeof value === "string" ? value : key
    }

    // Always provide the context so client consumers can call `useLanguage`
    // during their initial render. The language value defaults to 'en'
    // until the effect above updates it from localStorage.
    return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
    const context = useContext(LanguageContext)
    if (!context) {
        throw new Error("useLanguage must be used within LanguageProvider")
    }
    return context
}
