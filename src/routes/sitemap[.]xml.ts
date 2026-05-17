import { createFileRoute } from "@tanstack/react-router"

import { getAllPages, getSite } from "#/content/site"

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const [{ baseUrl }, pages] = await Promise.all([getSite(), getAllPages()])

        return new Response(
          `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  ${pages
    .map(
      ({ slug, updatedAt }) => `
  <url>
    <loc>${baseUrl}${slug}</loc>
    <lastmod>${updatedAt}</lastmod>
    <changefreq>weekly</changefreq>
  </url>`,
    )
    .join("")}
</urlset>
`,
          {
            headers: {
              "Content-Type": "application/xml",
              "Cache-Control": "public, max-age=15s, must-revalidate",
            },
          },
        )
      },
    },
  },
})
