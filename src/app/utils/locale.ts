export type AppLang = "uz" | "ru" | "en";

export function getAppLang(language: string): AppLang {
  if (language.startsWith("ru")) return "ru";
  if (language.startsWith("en")) return "en";
  return "uz";
}
