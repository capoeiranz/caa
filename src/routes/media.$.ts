import { PhotonImage, SamplingFilter, resize } from "@cf-wasm/photon/workerd"
import { createFileRoute } from "@tanstack/react-router"
import { env } from "cloudflare:workers"

const MEDIA_PATH = "/media"
const MEDIA_PATH_PREFIX = `${MEDIA_PATH}/`
const MAX_SOURCE_BYTES = 10 * 1024 * 1024
const MAX_WIDTH = 2560
// const LONG_CACHE_CONTROL = "public, max-age=31536000, immutable"
const LONG_CACHE_CONTROL = "public, max-age=0"
const DEFAULT_QUALITY = 75
const TRANSFORM_QUERY_KEYS = new Set(["w", "h", "fit", "q", "fmt"])

type OutputFormat = "webp" | "png" | "jpeg"

type TransformOptions = {
  width: number
  format?: OutputFormat
}

function badRequest(message: string) {
  return new Response(message, { status: 400 })
}

function payloadTooLarge(message: string) {
  return new Response(message, { status: 413 })
}

function parseSourcePath(requestUrl: URL) {
  if (!requestUrl.pathname.startsWith(MEDIA_PATH_PREFIX)) {
    return { error: badRequest("missing source path") }
  }

  const sourcePath = requestUrl.pathname.slice(MEDIA_PATH.length)
  if (!sourcePath || sourcePath === "/") {
    return { error: badRequest("missing source path") }
  }

  const segments = sourcePath.slice(1).split("/")
  if (
    segments.some((segment) => segment.length === 0 || segment === "." || segment === "..") ||
    segments[0] === "media"
  ) {
    return { error: badRequest("invalid source path") }
  }

  return { sourcePath }
}

function parseInteger(value: string) {
  if (!/^\d+$/.test(value)) {
    return
  }

  return Number(value)
}

function parseRawSearchParams(
  requestUrl: URL,
): { error: Response } | { pairs: Array<{ key: string; value: string }> } {
  const rawQuery = requestUrl.search.startsWith("?")
    ? requestUrl.search.slice(1)
    : requestUrl.search

  if (!rawQuery) {
    return { pairs: [] }
  }

  const pairs = rawQuery.split("&")
  if (pairs.some((pair) => pair.length === 0)) {
    return { error: badRequest("invalid transform params") }
  }

  return {
    pairs: pairs.map((pair) => {
      const separatorIndex = pair.indexOf("=")

      if (separatorIndex <= 0) {
        throw new Error("invalid transform params")
      }

      const key = pair.slice(0, separatorIndex)
      const value = pair.slice(separatorIndex + 1)

      if (!value) {
        throw new Error("invalid transform params")
      }

      return {
        key: decodeURIComponent(key),
        value: decodeURIComponent(value),
      }
    }),
  }
}

function parseTransformOptions(requestUrl: URL) {
  let parsedSearch: ReturnType<typeof parseRawSearchParams>
  try {
    parsedSearch = parseRawSearchParams(requestUrl)
  } catch {
    return { error: badRequest("invalid transform params") }
  }

  if ("error" in parsedSearch) {
    return parsedSearch
  }

  if (parsedSearch.pairs.length === 0) {
    return { options: null }
  }

  if (parsedSearch.pairs.length > 2) {
    return { error: badRequest("invalid transform params") }
  }

  const [widthPair, formatPair] = parsedSearch.pairs
  if (!widthPair || widthPair.key !== "w") {
    return { error: badRequest("invalid transform params") }
  }

  if (formatPair && (formatPair.key !== "fmt" || formatPair.value !== "webp")) {
    return { error: badRequest("invalid transform params") }
  }

  const width = parseInteger(widthPair.value)
  if (!width || width < 1 || width > MAX_WIDTH) {
    return { error: badRequest("invalid w") }
  }

  let format: OutputFormat | undefined
  if (formatPair?.value === "webp") {
    format = formatPair.value
  }

  return {
    options: {
      width,
      format,
    } satisfies TransformOptions,
  }
}

function getSourceFormat(contentType: string | null): OutputFormat | null {
  const mime = contentType?.split(";")[0]?.trim().toLowerCase()

  if (mime === "image/webp") {
    return "webp"
  }
  if (mime === "image/png") {
    return "png"
  }
  if (mime === "image/jpeg" || mime === "image/jpg") {
    return "jpeg"
  }

  return null
}

function buildHeaders(sourceResponse: Response, headersInit?: HeadersInit) {
  const headers = new Headers(headersInit)
  const sourceCacheControl = sourceResponse.headers.get("cache-control")

  if (sourceCacheControl && !headers.has("cache-control")) {
    headers.set("cache-control", sourceCacheControl)
  }

  return headers
}

function buildSourceRequestUrl(requestUrl: URL, sourcePath: string) {
  const sourceUrl = new URL(sourcePath, requestUrl.origin)

  for (const [key, value] of requestUrl.searchParams) {
    if (TRANSFORM_QUERY_KEYS.has(key)) {
      continue
    }

    sourceUrl.searchParams.append(key, value)
  }

  sourceUrl.hash = ""
  return sourceUrl
}

async function transformImage(
  sourceResponse: Response,
  transform: TransformOptions,
  includeBody: boolean,
) {
  const contentType = sourceResponse.headers.get("content-type")
  const sourceFormat = getSourceFormat(contentType)
  if (!sourceFormat) {
    return badRequest("unsupported source format")
  }

  const contentLengthHeader = sourceResponse.headers.get("content-length")
  if (contentLengthHeader) {
    const contentLength = Number(contentLengthHeader)
    if (Number.isFinite(contentLength) && contentLength > MAX_SOURCE_BYTES) {
      return payloadTooLarge("source too large")
    }
  }

  const sourceBytes = new Uint8Array(await sourceResponse.arrayBuffer())
  if (sourceBytes.byteLength > MAX_SOURCE_BYTES) {
    return payloadTooLarge("source too large")
  }

  let inputImage: PhotonImage | null = null
  let workingImage: PhotonImage | null = null
  let outputImage: PhotonImage | null = null

  try {
    inputImage = PhotonImage.new_from_byteslice(sourceBytes)
    workingImage = inputImage

    const sourceWidth = workingImage.get_width()
    const sourceHeight = workingImage.get_height()
    const outputWidth = Math.min(transform.width, sourceWidth)
    const height = Math.max(1, Math.round((sourceHeight * outputWidth) / sourceWidth))

    outputImage = resize(workingImage, outputWidth, height, SamplingFilter.Lanczos3)

    const outputFormat = transform.format ?? sourceFormat
    let outputBytes: Uint8Array
    if (outputFormat === "webp") {
      outputBytes = outputImage.get_bytes_webp()
    } else if (outputFormat === "jpeg") {
      outputBytes = outputImage.get_bytes_jpeg(DEFAULT_QUALITY)
    } else {
      outputBytes = outputImage.get_bytes()
    }

    const headers = buildHeaders(sourceResponse, {
      "cache-control": LONG_CACHE_CONTROL,
      "content-type": `image/${outputFormat}`,
      "x-media-mode": "transform",
      "x-media-format": outputFormat,
      "x-media-width": String(outputWidth),
    })

    const bodyBytes = Uint8Array.from(outputBytes)
    const body = includeBody ? bodyBytes : null

    return new Response(body, {
      status: 200,
      headers,
    })
  } catch {
    return badRequest("unsupported source format")
  } finally {
    inputImage?.free()
    if (workingImage && workingImage !== inputImage) {
      workingImage.free()
    }
    outputImage?.free()
  }
}

async function handleMediaRequest(request: Request, method: "GET" | "HEAD") {
  console.log("cloudflare env", Object.keys(env))
  const requestUrl = new URL(request.url)
  const parsed = parseSourcePath(requestUrl)
  if ("error" in parsed) {
    return parsed.error
  }

  console.log("parsed", { parsed }) // /assets/logo-DPA-DBKx.webp

  const transformParsed = parseTransformOptions(requestUrl)
  if ("error" in transformParsed) {
    return transformParsed.error
  }

  console.log("transformParsed", { transformParsed }) // "options": { "format": "webp", "width": 900, "height": 300, "quality": 75, }

  const sourceRequestUrl = buildSourceRequestUrl(requestUrl, parsed.sourcePath) // https://caa.capoeira.workers.dev/assets/logo-DPA-DBKx.webp

  console.log("sourceRequestUrl", { sourceRequestUrl })

  try {
    const includeBody = method === "GET"
    const sourceResponse = await env.ASSETS.fetch(sourceRequestUrl)

    if (!sourceResponse.ok) {
      const headers = buildHeaders(sourceResponse, {
        "content-type": sourceResponse.headers.get("content-type") ?? "text/plain; charset=utf-8",
        "x-media-mode": "source-error",
      })

      return new Response(includeBody ? sourceResponse.body : null, {
        status: sourceResponse.status,
        headers,
      })
    }

    if (!transformParsed.options) {
      const sourceFormat = getSourceFormat(sourceResponse.headers.get("content-type"))
      const headers = buildHeaders(sourceResponse, {
        "content-type": sourceResponse.headers.get("content-type") ?? "application/octet-stream",
        "x-media-mode": "passthrough",
        ...(sourceFormat ? { "x-media-format": sourceFormat } : {}),
      })

      return new Response(includeBody ? sourceResponse.body : null, {
        status: sourceResponse.status,
        headers,
      })
    }

    return transformImage(sourceResponse, transformParsed.options, includeBody)
  } catch (error) {
    console.error(error)
    return new Response("Server Error", { status: 500 })
  }
}

export const Route = createFileRoute("/media/$")({
  server: {
    handlers: {
      GET: (context) => handleMediaRequest(context.request, "GET"),
      HEAD: ({ request }) => handleMediaRequest(request, "HEAD"),
    },
  },
})
