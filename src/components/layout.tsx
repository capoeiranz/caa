import { TanStackDevtools } from "@tanstack/react-devtools"
import { HeadContent, Scripts } from "@tanstack/react-router"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"
import type { PropsWithChildren } from "react"

import { AppProvider } from "./app-provider"

function PageLayout({ children }: PropsWithChildren) {
  return <div className="grid min-h-svh justify-items-center">{children}</div>
}

export function Layout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="bg-background text-foreground">
        <AppProvider>
          <PageLayout>{children}</PageLayout>
        </AppProvider>
        <TanStackDevtools
          config={{
            position: "bottom-right",
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
