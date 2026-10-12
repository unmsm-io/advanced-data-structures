import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://advanced-data-structures.vercel.app",
  i18n: { locales: ["en", "es"], defaultLocale: "en", routing: { prefixDefaultLocale: true, redirectToDefaultLocale: false } },
});
