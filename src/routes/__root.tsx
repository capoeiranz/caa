import { createRootRoute } from "@tanstack/react-router"

import { Layout } from "#/components/layout"
import { NotFound } from "#/components/not-found"

import appCss from "../app.css?url"

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Capoeira Angola Aotearoa",
      },
      {
        description: "Capoeira Angola Classes with Mestre Brabo in Aotearoa, New Zealand",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  notFoundComponent: NotFound,
  shellComponent: Layout,
})
