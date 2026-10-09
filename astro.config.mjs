// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import starlight from "@astrojs/starlight";
import AutoImport from "astro-auto-import";
import icon from "astro-icon";
import starlightImageZoom from "starlight-image-zoom";

import keystatic from "./src/keystatic/integration.ts";
import { sidebar } from "./src/sidebar.mjs";

export default defineConfig({
  integrations: [
    starlight({
      title: "Marble Documentation",
      logo: {
        src: "./src/assets/logo.png",
        alt: "Marble",
        replacesTitle: true,
      },
      favicon: "/favicon.png",
      customCss: ["./src/styles/theme.css"],
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/checkmarble/marble",
        },
      ],
      components: {
        SocialIcons: "./src/components/SocialIcons.astro",
      },
      sidebar,
      plugins: [starlightImageZoom()],
      routeMiddleware: "./src/routeData.ts",
    }),
    // Components usable in any page without an import line, which keeps pages editable in Keystatic.
    // Must come after Starlight, which adds the MDX integration it hooks into.
    AutoImport({
      imports: [
        "./src/components/Columns.astro",
        "./src/components/Glossary.astro",
        "./src/components/Screenshot.astro",
        "./src/components/YouTube.astro",
        "./src/components/CoreFeatures.astro",
        "./src/components/FeatureCard.astro",
        "./src/components/FeatureGrid.astro",
        "./src/components/RecentReleases.astro",
        {
          "@astrojs/starlight/components": ["Aside", "Card", "CardGrid", "LinkCard", "Tabs", "TabItem"],
        },
      ],
    }),
    icon(),
    react(),
    keystatic(),
  ],
});
