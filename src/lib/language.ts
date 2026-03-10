/** Basic detection: Arabic script (Unicode 0600–06FF) vs English. No full NLP. */
export function detectLanguage(text: string): "Arabic" | "English" {
  const trimmed = text.trim();
  if (!trimmed) return "English";
  return /[\u0600-\u06FF]/.test(trimmed) ? "Arabic" : "English";
}
