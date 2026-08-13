// @ts-check
import { defineConfig } from "astro/config";
import { storyblok } from "@storyblok/astro";
import { loadEnv } from "vite";

const env = loadEnv("", process.cwd(), "STORYBLOK");

// https://astro.build/config
export default defineConfig({
  // Defina o domínio de produção para gerar canonical/OG absolutos:
  // site: "https://seu-dominio.com",
  integrations: [
    storyblok({
      accessToken: env.STORYBLOK_DELIVERY_API_TOKEN ?? "",
      // bridge:false — nenhum script do Storyblok é injetado nas páginas.
      // A landing page aprovada fica intocada; o Visual Editor funciona por
      // preview normal (recarrega ao salvar, sem live-update automático).
      bridge: false,
      apiOptions: {
        // Se o Space do Storyblok for hospedado nos EUA, adicione region: "us".
      },
    }),
  ],
});
