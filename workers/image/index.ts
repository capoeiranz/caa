const IMAGE_PATH = "/i"

type Env = {
  SITE_BASE_URL?: string
}

function badRequest(message: string) {
  return new Response(message, { status: 400 })
}

function notFound() {
  return new Response("not found", { status: 404 })
}

function methodNotAllowed() {
  return new Response("method not allowed", { status: 405 })
}

function parseSourceUrl(requestUrl: URL) {
  const src = requestUrl.searchParams.get("src")
  if (!src) {
    return { error: badRequest("missing src") }
  }

  let sourceUrl: URL
  try {
    sourceUrl = new URL(src)
  } catch {
    return { error: badRequest("invalid src") }
  }

  return { sourceUrl }
}

function isAllowedSource(sourceUrl: URL, env: Env) {
  if (!env.SITE_BASE_URL) {
    return true
  }

  try {
    const allowedOrigin = new URL(env.SITE_BASE_URL).origin
    return sourceUrl.origin === allowedOrigin
  } catch {
    return false
  }
}

function forwardHeaders(sourceResponse: Response, includeBody: boolean) {
  const headers = new Headers()
  const contentType = sourceResponse.headers.get("content-type")
  const cacheControl = sourceResponse.headers.get("cache-control")

  if (contentType) {
    headers.set("content-type", contentType)
  }
  if (cacheControl) {
    headers.set("cache-control", cacheControl)
  }

  return new Response(includeBody ? sourceResponse.body : null, {
    status: sourceResponse.status,
    headers,
  })
}

async function handleImageRequest(request: Request, env: Env) {
  const requestUrl = new URL(request.url)

  if (requestUrl.pathname !== IMAGE_PATH) {
    return notFound()
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    return methodNotAllowed()
  }

  const parsed = parseSourceUrl(requestUrl)
  if ("error" in parsed) {
    return parsed.error
  }

  if (!isAllowedSource(parsed.sourceUrl, env)) {
    return badRequest("src origin not allowed")
  }

  const sourceResponse = await fetch(parsed.sourceUrl.toString(), {
    method: "GET",
    headers: {
      accept: "image/*",
    },
  })

  return forwardHeaders(sourceResponse, request.method === "GET")
}

export default {
  fetch(request: Request, env: Env) {
    return handleImageRequest(request, env)
  },
}
