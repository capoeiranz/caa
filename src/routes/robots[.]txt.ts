import { createFileRoute } from "@tanstack/react-router"

import { getSite } from "#/content/site"

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: async () => {
        const { baseUrl } = await getSite()

        return new Response(
          `
User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml
`,
          {
            headers: {
              "Content-Type": "text/plain",
              "Cache-Control": "public, max-age=25s, must-revalidate",
            },
          },
        )
      },
    },
  },
})
