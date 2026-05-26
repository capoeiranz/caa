function normalize(path: string): string {
  return path.replace(/\/+$/, "") || "/"
}

function segments(path: string): string[] {
  return path.split("/").filter(Boolean)
}

export function safeParsePath(fullUrl: string, path: string = ""): string | undefined {
  if (!path.startsWith("/")) {
    return undefined
  }

  let url: URL

  try {
    url = new URL(fullUrl)
  } catch {
    return undefined
  }

  const pathname = normalize(url.pathname)
  const suffix = normalize(path)

  if (!pathname.endsWith(suffix)) {
    return undefined
  }

  const prefix = pathname.slice(0, pathname.length - suffix.length) || "/"

  const prefixSegs = segments(prefix)
  const suffixSegs = segments(suffix)

  if (prefixSegs.length > suffixSegs.length) {
    return path
  }

  return prefixSegs.every((seg, i) => seg === suffixSegs[i]) ? undefined : path
}
