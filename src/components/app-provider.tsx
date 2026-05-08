import type { PropsWithChildren } from "react"

import { TooltipProvider } from "@/components/ui/tooltip"

export function AppProvider({ children }: PropsWithChildren) {
  return <TooltipProvider>{children}</TooltipProvider>
}
