export { cn } from "@tohuhono/utils"

export type CN<T> = Omit<T, "className"> & {
  className?: string
}
