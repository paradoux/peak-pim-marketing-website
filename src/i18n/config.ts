import { canonicalUrl } from "../lib/site-url";

export const locales = ["en", "fr", "de", "es", "it", "nl", "pt-br", "pl", "ja"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";
export const translatedLocales = locales.filter((locale) => locale !== defaultLocale) as Exclude<Locale, "en">[];

export const localeMetadata = {
  en: { label: "English", shortLabel: "EN", hreflang: "en", ogLocale: "en_US", flag: "🇬🇧", languageMenuLabel: "Choose a language" },
  fr: { label: "Français", shortLabel: "FR", hreflang: "fr", ogLocale: "fr_FR", flag: "🇫🇷", languageMenuLabel: "Choisir une langue" },
  de: { label: "Deutsch", shortLabel: "DE", hreflang: "de", ogLocale: "de_DE", flag: "🇩🇪", languageMenuLabel: "Sprache auswählen" },
  es: { label: "Español", shortLabel: "ES", hreflang: "es", ogLocale: "es_ES", flag: "🇪🇸", languageMenuLabel: "Seleccionar idioma" },
  it: { label: "Italiano", shortLabel: "IT", hreflang: "it", ogLocale: "it_IT", flag: "🇮🇹", languageMenuLabel: "Seleziona una lingua" },
  nl: { label: "Nederlands", shortLabel: "NL", hreflang: "nl", ogLocale: "nl_NL", flag: "🇳🇱", languageMenuLabel: "Kies een taal" },
  "pt-br": { label: "Português (BR)", shortLabel: "PT-BR", hreflang: "pt-BR", ogLocale: "pt_BR", flag: "🇧🇷", languageMenuLabel: "Escolher um idioma" },
  pl: { label: "Polski", shortLabel: "PL", hreflang: "pl", ogLocale: "pl_PL", flag: "🇵🇱", languageMenuLabel: "Wybierz język" },
  ja: { label: "日本語", shortLabel: "JA", hreflang: "ja", ogLocale: "ja_JP", flag: "🇯🇵", languageMenuLabel: "言語を選択" },
} as const satisfies Record<Locale, {
  label: string;
  shortLabel: string;
  hreflang: string;
  ogLocale: string;
  flag: string;
  languageMenuLabel: string;
}>;

type LocalizedRoute = {
  key: string;
  paths: Record<Locale, string>;
};

function route(key: string, paths: Record<Locale, string>): LocalizedRoute {
  return { key, paths };
}

export const localizedRoutes: LocalizedRoute[] = [
  route("home", { en: "/", fr: "/fr", de: "/de", es: "/es", it: "/it", nl: "/nl", "pt-br": "/pt-br", pl: "/pl", ja: "/ja" }),
  route("1-click-setup", { en: "/1-click-setup", fr: "/fr/configuration-en-un-clic", de: "/de/einrichtung-mit-einem-klick", es: "/es/configuracion-en-un-clic", it: "/it/configurazione-in-un-clic", nl: "/nl/installatie-met-een-klik", "pt-br": "/pt-br/configuracao-em-um-clique", pl: "/pl/konfiguracja-jednym-kliknieciem", ja: "/ja/one-click-settei" }),
  route("bulk-edit", { en: "/bulk-edit", fr: "/fr/modification-en-bloc", de: "/de/massenbearbeitung", es: "/es/edicion-masiva", it: "/it/modifica-massiva", nl: "/nl/bulkbewerking", "pt-br": "/pt-br/edicao-em-massa", pl: "/pl/edycja-zbiorcza", ja: "/ja/ikkatsu-henshu" }),
  route("industry-fashion", { en: "/industry/fashion", fr: "/fr/secteurs/mode", de: "/de/branchen/mode", es: "/es/sectores/moda", it: "/it/settori/moda", nl: "/nl/sectoren/mode", "pt-br": "/pt-br/setores/moda", pl: "/pl/branze/moda", ja: "/ja/gyokai/fashion" }),
  route("mission", { en: "/mission", fr: "/fr/mission", de: "/de/mission", es: "/es/mision", it: "/it/missione", nl: "/nl/missie", "pt-br": "/pt-br/missao", pl: "/pl/misja", ja: "/ja/mission" }),
  route("pricing", { en: "/pricing", fr: "/fr/tarifs", de: "/de/preise", es: "/es/precios", it: "/it/prezzi", nl: "/nl/prijzen", "pt-br": "/pt-br/precos", pl: "/pl/cennik", ja: "/ja/ryokin" }),
  route("replace-shopify-app-stack", { en: "/replace-your-shopify-app-stack", fr: "/fr/remplacer-vos-applications-shopify", de: "/de/shopify-apps-ersetzen", es: "/es/reemplazar-aplicaciones-shopify", it: "/it/sostituire-app-shopify", nl: "/nl/shopify-apps-vervangen", "pt-br": "/pt-br/substituir-aplicativos-shopify", pl: "/pl/zastap-aplikacje-shopify", ja: "/ja/shopify-app-ikou" }),
  route("shopify-media-management", { en: "/shopify-media-management", fr: "/fr/gestion-medias-shopify", de: "/de/shopify-medienverwaltung", es: "/es/gestion-medios-shopify", it: "/it/gestione-media-shopify", nl: "/nl/shopify-mediabeheer", "pt-br": "/pt-br/gerenciamento-midias-shopify", pl: "/pl/zarzadzanie-mediami-shopify", ja: "/ja/shopify-media-kanri" }),
  route("shopify-multi-store-pim", { en: "/shopify-multi-store-pim", fr: "/fr/pim-multiboutique-shopify", de: "/de/shopify-pim-mehrere-shops", es: "/es/pim-multitienda-shopify", it: "/it/pim-multinegozio-shopify", nl: "/nl/shopify-pim-meerdere-winkels", "pt-br": "/pt-br/pim-multiloja-shopify", pl: "/pl/shopify-pim-wiele-sklepow", ja: "/ja/shopify-fukusu-store-pim" }),
  route("shopify-pim-alternatives", { en: "/shopify-pim-alternatives", fr: "/fr/alternatives-pim-shopify", de: "/de/shopify-pim-alternativen", es: "/es/alternativas-pim-shopify", it: "/it/alternative-pim-shopify", nl: "/nl/shopify-pim-alternatieven", "pt-br": "/pt-br/alternativas-pim-shopify", pl: "/pl/alternatywy-pim-shopify", ja: "/ja/shopify-pim-daitai" }),
  route("shopify-sync", { en: "/shopify-sync", fr: "/fr/synchronisation-shopify", de: "/de/shopify-synchronisierung", es: "/es/sincronizacion-shopify", it: "/it/sincronizzazione-shopify", nl: "/nl/shopify-synchronisatie", "pt-br": "/pt-br/sincronizacao-shopify", pl: "/pl/synchronizacja-shopify", ja: "/ja/shopify-doki" }),
  route("vs-akeneo", { en: "/vs/akeneo", fr: "/fr/comparatif/akeneo", de: "/de/vergleich/akeneo", es: "/es/comparativa/akeneo", it: "/it/confronto/akeneo", nl: "/nl/vergelijking/akeneo", "pt-br": "/pt-br/comparativo/akeneo", pl: "/pl/porownanie/akeneo", ja: "/ja/hikaku/akeneo" }),
  route("vs-catsy", { en: "/vs/catsy", fr: "/fr/comparatif/catsy", de: "/de/vergleich/catsy", es: "/es/comparativa/catsy", it: "/it/confronto/catsy", nl: "/nl/vergelijking/catsy", "pt-br": "/pt-br/comparativo/catsy", pl: "/pl/porownanie/catsy", ja: "/ja/hikaku/catsy" }),
  route("vs-plytix", { en: "/vs/plytix", fr: "/fr/comparatif/plytix", de: "/de/vergleich/plytix", es: "/es/comparativa/plytix", it: "/it/confronto/plytix", nl: "/nl/vergelijking/plytix", "pt-br": "/pt-br/comparativo/plytix", pl: "/pl/porownanie/plytix", ja: "/ja/hikaku/plytix" }),
  route("vs-quable", { en: "/vs/quable", fr: "/fr/comparatif/quable", de: "/de/vergleich/quable", es: "/es/comparativa/quable", it: "/it/confronto/quable", nl: "/nl/vergelijking/quable", "pt-br": "/pt-br/comparativo/quable", pl: "/pl/porownanie/quable", ja: "/ja/hikaku/quable" }),
  route("vs-shopify-admin", { en: "/vs/shopify-admin", fr: "/fr/comparatif/interface-administrateur-shopify", de: "/de/vergleich/shopify-adminbereich", es: "/es/comparativa/panel-administracion-shopify", it: "/it/confronto/pannello-amministrazione-shopify", nl: "/nl/vergelijking/shopify-beheercentrum", "pt-br": "/pt-br/comparativo/admin-shopify", pl: "/pl/porownanie/panel-administracyjny-shopify", ja: "/ja/hikaku/shopify-kanri-gamen" }),
  route("blog", { en: "/blog", fr: "/fr/blog", de: "/de/blog", es: "/es/blog", it: "/it/blog", nl: "/nl/blog", "pt-br": "/pt-br/blog", pl: "/pl/blog", ja: "/ja/blog" }),
  route("guides", { en: "/guides", fr: "/fr/guides", de: "/de/ratgeber", es: "/es/guias", it: "/it/guide", nl: "/nl/gidsen", "pt-br": "/pt-br/guias", pl: "/pl/poradniki", ja: "/ja/guide" }),
  route("ai-assistant", { en: "/ai-assistant", fr: "/fr/assistant-ia", de: "/de/ki-assistent", es: "/es/asistente-ia", it: "/it/assistente-ia", nl: "/nl/ai-assistent", "pt-br": "/pt-br/assistente-ia", pl: "/pl/asystent-ai", ja: "/ja/ai-assistant" }),
  route("history", { en: "/history", fr: "/fr/historique-catalogue", de: "/de/katalogverlauf", es: "/es/historial-catalogo", it: "/it/cronologia-catalogo", nl: "/nl/catalogusgeschiedenis", "pt-br": "/pt-br/historico-catalogo", pl: "/pl/historia-katalogu", ja: "/ja/catalog-rireki" }),
  route("search", { en: "/search", fr: "/fr/recherche-catalogue", de: "/de/katalogsuche", es: "/es/busqueda-catalogo", it: "/it/ricerca-catalogo", nl: "/nl/catalogus-zoeken", "pt-br": "/pt-br/busca-catalogo", pl: "/pl/wyszukiwanie-katalogu", ja: "/ja/catalog-kensaku" }),
  route("shopify-pim-translations", { en: "/shopify-pim-translations", fr: "/fr/traductions-produits-shopify", de: "/de/shopify-produktuebersetzungen", es: "/es/traducciones-productos-shopify", it: "/it/traduzioni-prodotti-shopify", nl: "/nl/shopify-productvertalingen", "pt-br": "/pt-br/traducoes-produtos-shopify", pl: "/pl/tlumaczenia-produktow-shopify", ja: "/ja/shopify-shohin-honyaku" }),
  route("shopify-product-import-export", { en: "/shopify-product-import-export", fr: "/fr/import-export-produits-shopify", de: "/de/shopify-produkte-import-export", es: "/es/importacion-exportacion-productos-shopify", it: "/it/importazione-esportazione-prodotti-shopify", nl: "/nl/shopify-product-import-export", "pt-br": "/pt-br/importacao-exportacao-produtos-shopify", pl: "/pl/import-eksport-produktow-shopify", ja: "/ja/shopify-shohin-import-export" }),
  route("shopify-product-drops", { en: "/shopify-product-drops", fr: "/fr/drops-produits-shopify", de: "/de/shopify-produkt-drops", es: "/es/lanzamientos-productos-shopify", it: "/it/lanci-prodotti-shopify", nl: "/nl/shopify-productdrops", "pt-br": "/pt-br/lancamentos-produtos-shopify", pl: "/pl/premiery-produktow-shopify", ja: "/ja/shopify-shohin-drop" }),
  route("shopify-catalog-health-center", { en: "/shopify-catalog-health-center", fr: "/fr/centre-controle-catalogue-shopify", de: "/de/shopify-katalogpruefung", es: "/es/centro-control-catalogo-shopify", it: "/it/centro-controllo-catalogo-shopify", nl: "/nl/shopify-cataloguscontrole", "pt-br": "/pt-br/central-controle-catalogo-shopify", pl: "/pl/centrum-kontroli-katalogu-shopify", ja: "/ja/shopify-catalog-kenko-check" }),
  route("ai-catalog-connector", { en: "/ai-catalog-connector", fr: "/fr/connecteur-catalogue-ia", de: "/de/ki-katalog-konnektor", es: "/es/conector-catalogo-ia", it: "/it/connettore-catalogo-ia", nl: "/nl/ai-catalogusconnector", "pt-br": "/pt-br/conector-catalogo-ia", pl: "/pl/konektor-katalogu-ai", ja: "/ja/ai-catalog-connector" }),
  route("api", { en: "/api", fr: "/fr/api", de: "/de/api", es: "/es/api", it: "/it/api", nl: "/nl/api", "pt-br": "/pt-br/api", pl: "/pl/api", ja: "/ja/api" }),
  route("shopify-metaobjects", { en: "/shopify-metaobjects", fr: "/fr/metaobjets-shopify", de: "/de/shopify-metaobjekte", es: "/es/metaobjetos-shopify", it: "/it/metaoggetti-shopify", nl: "/nl/shopify-metaobjecten", "pt-br": "/pt-br/metaobjetos-shopify", pl: "/pl/metaobiekty-shopify", ja: "/ja/shopify-metaobject" }),
  route("shopify-collections", { en: "/shopify-collections", fr: "/fr/collections-shopify", de: "/de/shopify-kategorien", es: "/es/colecciones-shopify", it: "/it/collezioni-shopify", nl: "/nl/shopify-collecties", "pt-br": "/pt-br/colecoes-shopify", pl: "/pl/kolekcje-shopify", ja: "/ja/shopify-collection-kanri" }),
  route("shopify-markets-pricing", { en: "/shopify-markets-pricing", fr: "/fr/tarification-shopify-markets", de: "/de/shopify-markets-preise", es: "/es/precios-shopify-markets", it: "/it/prezzi-shopify-markets", nl: "/nl/shopify-markets-prijzen", "pt-br": "/pt-br/precos-shopify-markets", pl: "/pl/ceny-shopify-markets", ja: "/ja/shopify-markets-kakaku" }),
  route("shopify-product-management", { en: "/shopify-product-management", fr: "/fr/gestion-produits-shopify", de: "/de/shopify-produktverwaltung", es: "/es/gestion-productos-shopify", it: "/it/gestione-prodotti-shopify", nl: "/nl/shopify-productbeheer", "pt-br": "/pt-br/gerenciamento-produtos-shopify", pl: "/pl/zarzadzanie-produktami-shopify", ja: "/ja/shopify-shohin-kanri" }),
  route("shopify-metafield-management", { en: "/shopify-metafield-management", fr: "/fr/gestion-champs-meta-shopify", de: "/de/shopify-metafeldverwaltung", es: "/es/gestion-metacampos-shopify", it: "/it/gestione-metafield-shopify", nl: "/nl/shopify-metaveldenbeheer", "pt-br": "/pt-br/gerenciamento-metacampos-shopify", pl: "/pl/zarzadzanie-metapolami-shopify", ja: "/ja/shopify-metafield-kanri" }),
  route("shopify-custom-fields", { en: "/shopify-custom-fields", fr: "/fr/champs-personnalises-shopify", de: "/de/benutzerdefinierte-felder-shopify", es: "/es/campos-personalizados-shopify", it: "/it/campi-personalizzati-shopify", nl: "/nl/aangepaste-velden-shopify", "pt-br": "/pt-br/campos-personalizados-shopify", pl: "/pl/pola-niestandardowe-shopify", ja: "/ja/shopify-custom-field" }),
  route("user-roles-permissions", { en: "/user-roles-permissions", fr: "/fr/roles-autorisations-utilisateurs", de: "/de/benutzerrollen-berechtigungen", es: "/es/roles-permisos-usuarios", it: "/it/ruoli-autorizzazioni-utenti", nl: "/nl/gebruikersrollen-rechten", "pt-br": "/pt-br/funcoes-permissoes-usuarios", pl: "/pl/role-uprawnienia-uzytkownikow", ja: "/ja/user-role-kengen" }),
  route("build-vs-buy-pim", { en: "/build-vs-buy-pim", fr: "/fr/creer-ou-acheter-pim", de: "/de/pim-erstellen-oder-kaufen", es: "/es/crear-o-comprar-pim", it: "/it/creare-o-acquistare-pim", nl: "/nl/pim-bouwen-of-kopen", "pt-br": "/pt-br/criar-ou-comprar-pim", pl: "/pl/zbudowac-czy-kupic-pim", ja: "/ja/pim-kaihatsu-ka-kounyu" }),
  route("customer-maeli-paris", { en: "/customers/maeli-paris", fr: "/fr/clients/maeli-paris", de: "/de/kunden/maeli-paris", es: "/es/clientes/maeli-paris", it: "/it/clienti/maeli-paris", nl: "/nl/klanten/maeli-paris", "pt-br": "/pt-br/clientes/maeli-paris", pl: "/pl/klienci/maeli-paris", ja: "/ja/customers/maeli-paris" }),
  route("customer-carre-coco", { en: "/customers/carre-coco", fr: "/fr/clients/carre-coco", de: "/de/kunden/carre-coco", es: "/es/clientes/carre-coco", it: "/it/clienti/carre-coco", nl: "/nl/klanten/carre-coco", "pt-br": "/pt-br/clientes/carre-coco", pl: "/pl/klienci/carre-coco", ja: "/ja/customers/carre-coco" }),
];

function normalizePath(path: string) {
  if (!path || path === "/") return "/";
  return `/${path.replace(/^\/+|\/+$/g, "")}`;
}

export function publicPath(path: string) {
  const normalizedPath = normalizePath(path);
  return normalizedPath === "/" ? "/" : `${normalizedPath}/`;
}

export function getLocaleFromPath(path: string): Locale {
  const firstSegment = normalizePath(path).split("/")[1]?.toLowerCase();
  return locales.includes(firstSegment as Locale) ? firstSegment as Locale : defaultLocale;
}

export function getRoutePath(path: string, locale: Locale) {
  const localizedPath = getLocalizedPath(path, locale);
  return localizedPath ? publicPath(localizedPath) : undefined;
}

export function findLocalizedRoute(path: string) {
  const normalizedPath = normalizePath(path);
  return localizedRoutes.find((candidate) => Object.values(candidate.paths).includes(normalizedPath));
}

export function getLocalizedPath(path: string, locale: Locale) {
  return findLocalizedRoute(path)?.paths[locale];
}

export function getLocaleAlternates(path: string) {
  const matchedRoute = findLocalizedRoute(path);
  if (!matchedRoute) return [];

  return locales.map((locale) => ({
    locale,
    hreflang: localeMetadata[locale].hreflang,
    path: matchedRoute.paths[locale],
    url: canonicalUrl(matchedRoute.paths[locale]),
  }));
}

export function localizeInternalHref(href: string, locale: Locale) {
  if (locale === defaultLocale || !href.startsWith("/") || href.startsWith("//")) return href;

  const [path, suffix = ""] = href.split(/(?=[?#])/u, 2);
  const localizedPath = getLocalizedPath(path, locale);
  return localizedPath ? `${publicPath(localizedPath)}${suffix}` : href;
}
