// Acesso ao Storyblok — só a pasta `blog`, só o content type `blog_post`.
// Em build de produção (`astro build`) e no build da Vercel, import.meta.env.PROD
// é sempre true, então só entra conteúdo com version "published". Em `astro dev`
// entra "draft" também, para permitir revisar rascunhos e testar o Visual Editor.
//
// Usa storyblok-js-client diretamente (em vez de useStoryblokApi() do
// @storyblok/astro) porque getStaticPaths() roda numa etapa do build anterior
// à injeção do cliente da integração, e falhava com "storyblokApiInstance has
// not been initialized correctly".
import StoryblokClient from "storyblok-js-client";

const VERSION = import.meta.env.PROD ? "published" : "draft";

let client;
function getClient() {
  if (!client) {
    client = new StoryblokClient({
      accessToken: import.meta.env.STORYBLOK_DELIVERY_API_TOKEN ?? "",
    });
  }
  return client;
}

/** Lista os posts do blog, do mais recente para o mais antigo. */
export async function getBlogPosts() {
  try {
    const { data } = await getClient().get("cdn/stories", {
      starts_with: "blog/",
      content_type: "blog_post",
      version: VERSION,
      sort_by: "content.published_at:desc",
    });
    return data?.stories ?? [];
  } catch (err) {
    console.warn("[storyblok] Não foi possível carregar os posts do blog:", err?.message ?? err);
    return [];
  }
}

/** Busca um post específico pelo slug (dentro de `blog/`). */
export async function getBlogPostBySlug(slug) {
  try {
    const { data } = await getClient().get(`cdn/stories/blog/${slug}`, {
      version: VERSION,
    });
    return data?.story ?? null;
  } catch {
    return null;
  }
}

/** Formata uma data ISO (published_at) como "12 de agosto de 2026". */
export function formatBlogDate(isoDate) {
  if (!isoDate) return "";
  const date = new Date(isoDate.replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(date);
}
