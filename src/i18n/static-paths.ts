import { localizedRoutes, publicPath, type Locale } from "./config";

export function localizedStaticPaths(locale: Exclude<Locale, "en">, excludedKeys: string[] = []) {
  return localizedRoutes
    .filter((route) => !excludedKeys.includes(route.key))
    .map((route) => ({
      params: {
        slug: route.paths[locale].replace(new RegExp(`^/${locale}/?`), "") || undefined,
      },
      props: { englishPath: publicPath(route.paths.en) },
    }));
}
