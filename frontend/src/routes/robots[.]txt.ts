import { createFileRoute } from "@tanstack/react-router";
import { API_URL, SITE_URL } from "@/lib/admin-api";

const DEFAULT_ROBOTS_TXT = `User-Agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

User-Agent: Googlebot
Allow: /

User-Agent: Bingbot
Allow: /

User-Agent: GPTBot
Allow: /

User-Agent: ChatGPT-User
Allow: /

User-Agent: Google-Extended
Allow: /

User-Agent: PerplexityBot
Allow: /

User-Agent: ClaudeBot
Allow: /

User-Agent: anthropic-ai
Allow: /

User-Agent: cohere-ai
Allow: /

User-Agent: CCBot
Allow: /

User-Agent: Diffbot
Allow: /

User-Agent: Bytespider
Allow: /

User-Agent: Applebot
Allow: /

User-Agent: Meta-ExternalAgent
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml`;

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: async () => {
        let body = DEFAULT_ROBOTS_TXT;
        try {
          const res = await fetch(`${API_URL}/api/seo/config`);
          if (res.ok) {
            const config = await res.json();
            if (config?.robotsTxt) body = config.robotsTxt;
          }
        } catch {
          // fall back to default below — a backend hiccup should never take robots.txt down
        }
        return new Response(body, {
          headers: { "content-type": "text/plain; charset=utf-8" },
        });
      },
    },
  },
});
