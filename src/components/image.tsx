import { Image as UnpicImage } from "@unpic/react"
import type { ComponentProps } from "react"

type ImageProps = ComponentProps<typeof UnpicImage>

type ImageTransform = {
  width?: number
  quality?: number
  format?: "webp" | "png" | "jpeg"
}

const UNSUPPORTED_FORMAT_PATTERN = /\.(svg|gif|avif)(?:$|[?#])/i

function buildImageUrl(src: string, transform: ImageTransform = {}) {
  if (UNSUPPORTED_FORMAT_PATTERN.test(src)) {
    return src
  }

  const searchParams = new URLSearchParams()

  if (transform.width) {
    searchParams.set("w", String(transform.width))
  }
  if (transform.quality) {
    searchParams.set("q", String(transform.quality))
  }
  if (transform.format) {
    searchParams.set("fmt", transform.format)
  }

  return `/media${src}?${searchParams}`
}

function getResponsiveWidths(width: number) {
  const candidates = [width, Math.round(width * 1.5), width * 2, width * 3]

  return [...new Set(candidates.filter((candidate) => candidate > 0 && candidate <= 2560))]
}

function buildSrcSet(src: string, transform: Omit<ImageTransform, "width">, widths: number[]) {
  return widths
    .map((width) => `${buildImageUrl(src, { ...transform, width })} ${width}w`)
    .join(", ")
}

export function Image({ src, ...props }: ImageProps) {
  if (!src) {
    return <UnpicImage src={src} {...props} />
  }

  const source = String(src)
  const widthValue = typeof props.width === "number" ? props.width : Number(props.width)
  const hasResponsiveDimensions = Number.isFinite(widthValue) && widthValue > 0

  if (!hasResponsiveDimensions) {
    return <UnpicImage src={buildImageUrl(source)} {...props} />
  }

  const widths = getResponsiveWidths(widthValue)
  const fallbackSrc = buildImageUrl(source, { width: widthValue })
  const fallbackSrcSet = buildSrcSet(source, {}, widths)
  const webpSrcSet = buildSrcSet(
    source,
    {
      format: "webp",
    },
    widths,
  )

  if (UNSUPPORTED_FORMAT_PATTERN.test(source)) {
    return <UnpicImage src={source} {...props} />
  }

  return (
    <picture>
      <source type="image/webp" srcSet={webpSrcSet} sizes={props.sizes ?? "100vw"} />
      <UnpicImage src={fallbackSrc} srcSet={fallbackSrcSet} {...props} />
    </picture>
  )
}
