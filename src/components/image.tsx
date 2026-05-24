import { Image as BaseImage, Source, type ImageProps as UnpicImageProps } from "@unpic/react/base"

const SUPPORTED_FORMATS = ["webp", "jpg", "png"] as const
type SupportedFormat = (typeof SUPPORTED_FORMATS)[number]
const TRANSFORMER_BASE = "https://unpic.invalid"

type MediaOperations = {
  width?: number | string
  format?: "webp" | "jpg" | "png" | (string & {})
}

type BaseImageProps = UnpicImageProps<MediaOperations, never>
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never
type ImageProps = DistributiveOmit<BaseImageProps, "transformer">

function getExtension(filename: string): string {
  const i = filename.lastIndexOf(".")
  return i < 0 ? "" : filename.slice(i + 1)
}

function toSafeWidth(width: MediaOperations["width"]) {
  const numericWidth = typeof width === "number" ? width : Number(width)
  if (!Number.isFinite(numericWidth) || numericWidth <= 0) {
    return
  }

  return Math.round(numericWidth)
}

const transform = (
  src: string | URL,
  operations: {
    width?: number | string
    format?: SupportedFormat | (string & {})
  } = {},
) => {
  const sourceURL = new URL(src, TRANSFORMER_BASE)
  if (sourceURL.origin !== TRANSFORMER_BASE) {
    return String(src)
  }

  const pathname = sourceURL.pathname

  const extension = getExtension(pathname)
  if (!SUPPORTED_FORMATS.includes(extension)) {
    return String(src)
  }

  const transformedPath = `/media${pathname}`

  const searchParams = new URLSearchParams()

  const width = toSafeWidth(operations.width)
  if (width) {
    searchParams.set("w", String(width))
  }

  if (operations.format === "webp") {
    searchParams.set("fmt", "webp")
  }

  return searchParams.size ? `${transformedPath}?${searchParams}` : transformedPath
}

export function Image(props: ImageProps) {
  return (
    <picture>
      <Source transformer={transform} type="image/webp" {...props} />
      <BaseImage transformer={transform} {...props} />
    </picture>
  )
}
