import { Image as UnpicImage } from "@unpic/react"
import type { ComponentProps } from "react"

type ImageProps = ComponentProps<typeof UnpicImage>

const SITE_BASE_URL = import.meta.env.VITE_SITE_BASE_URL ?? "http://localhost:3000"
const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL

function normalizeSourceUrl(src: string) {
  if (src.startsWith("/")) {
    return new URL(src, SITE_BASE_URL).toString()
  }

  try {
    return new URL(src).toString()
  } catch {
    return new URL(src, SITE_BASE_URL).toString()
  }
}

function buildImageUrl(src: string) {
  const sourceUrl = normalizeSourceUrl(src)

  if (!IMAGE_BASE_URL) {
    return sourceUrl
  }

  const imageUrl = new URL("/i", IMAGE_BASE_URL)

  imageUrl.searchParams.set("src", sourceUrl)

  return imageUrl.toString()
}

export function Image({ src, ...props }: ImageProps) {
  if (!src) {
    return <UnpicImage src={src} {...props} />
  }

  return <UnpicImage src={buildImageUrl(String(src))} {...props} />
}
