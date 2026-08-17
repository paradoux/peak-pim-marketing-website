import de from "./de-translations.json";
import es from "./es-translations.json";
import fr from "./fr-translations.json";
import it from "./it-translations.json";
import ja from "./ja-translations.json";
import nl from "./nl-translations.json";
import pl from "./pl-translations.json";
import ptBr from "./pt-br-translations.json";
import type { Locale } from "./config";

type TranslatedLocale = Exclude<Locale, "en">;

export const translationCaches = {
  fr,
  de,
  es,
  it,
  nl,
  "pt-br": ptBr,
  pl,
  ja,
} as Record<TranslatedLocale, Record<string, string>>;
