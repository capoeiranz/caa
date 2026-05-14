import { TanStackDevtools } from "@tanstack/react-devtools"
import { HeadContent, Scripts } from "@tanstack/react-router"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"
import { Antifouc } from "@tohuhono/ui/antifouc"
import { ModeToggle } from "@tohuhono/ui/mode-toggle"
import type { PropsWithChildren } from "react"

import { AppProvider } from "./app-provider"

function PageLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex min-h-svh w-full flex-col">
      <div className="grid w-full p-2">
        <ModeToggle className="justify-self-end" />
      </div>
      <div className="flex-1">{children}</div>
    </div>
  )
}

export function Layout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        <Antifouc />
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
