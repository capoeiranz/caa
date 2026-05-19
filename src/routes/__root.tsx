import { createRootRoute } from "@tanstack/react-router"

import coverImage from "#/assets/og_logo.png"
import { Layout } from "#/components/layout"
import { NotFound } from "#/components/not-found"
import { getSite } from "#/content/site"

import appCss from "../app.css?url"

export const Route = createRootRoute({
  head: async () => {
    const { title, description } = await getSite()
    return {
      meta: [
        {
          charSet: "utf-8",
        },
        {
          name: "viewport",
          content: "width=device-width, initial-scale=1",
        },
        {
          title,
        },
        {
          name: "description",
          content: description,
        },
        // Open Graph
        { property: "og:type", content: "article" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:image", content: coverImage },
        // Twitter Card
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: coverImage },
      ],
      links: [
        {
          rel: "stylesheet",
          href: appCss,
        },
      ],
    }
  },
  notFoundComponent: NotFound,
  shellComponent: Layout,
})
