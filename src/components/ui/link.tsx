import { Link as BaseLink } from "@tanstack/react-router"
import type { ComponentProps } from "react"

import { buttonVariants } from "./button"

export function Link({ className, ...props }: ComponentProps<typeof BaseLink>) {
  return <BaseLink className={buttonVariants({ variant: "link", className })} {...props} />
}
