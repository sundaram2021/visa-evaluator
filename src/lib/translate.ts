/**
 * Client-side translation utility for dynamic content
 * Uses a simple translation approach - in production, you might want to use
 * a translation API like Google Translate, DeepL, or LibreTranslate
 */

type Language = "en" | "es" | "fr" | "de" | "pt" | "ar" | "zh" | "ja"

/**
 * Translates dynamic text content to the target language
 * For now, returns original text for English or marks as needing translation
 * In production, integrate with a translation API
 */
export async function translateText(
  text: string | string[],
  targetLang: Language
): Promise<string | string[]> {
  // If already English or no translation needed, return as-is
  if (targetLang === "en" || !text) {
    return text
  }

  const isArray = Array.isArray(text)
  const textsToTranslate = isArray ? text : [text]

  // In a production environment, you would call a translation API here
  // For example: Google Translate API, DeepL API, or LibreTranslate
  // For now, we'll return the original text since translation APIs require API keys
  
  // Example structure for future API integration:
  // const translated = await fetch('/api/translate', {
  //   method: 'POST',
  //   body: JSON.stringify({ texts: textsToTranslate, targetLang })
  // }).then(r => r.json())

  // Return original for now - you can integrate a translation API later
  return isArray ? textsToTranslate : textsToTranslate[0]
}

/**
 * Hook to check if content should be translated
 */
export function shouldTranslateContent(language: Language): boolean {
  return language !== "en"
}
