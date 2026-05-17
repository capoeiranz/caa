import { createRootRoute } from "@tanstack/react-router"

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
          description,
        },
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
