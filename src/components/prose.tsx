import type { PropsWithChildren } from "react"

import { cn } from "#/lib/utils"

export function Prose({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <div className={cn("prose dark:prose-invert lg:prose-xl", className)}>{children}</div>
}
