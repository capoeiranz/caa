export function safeParseFast(fullUrl: string, path: string = ""): string | undefined {
  // 1. Fast, low-allocation prefix check
  if (path.charCodeAt(0) !== 47) return undefined // 47 is '/'

  let url: URL
  try {
    url = new URL(fullUrl)
  } catch {
    return undefined
  }

  const pathname = url.pathname

  // 2. Compute exact lengths without allocating new sliced strings
  let pathLen = path.length
  while (pathLen > 1 && path.charCodeAt(pathLen - 1) === 47) {
    pathLen--
  }

  let nameLen = pathname.length
  while (nameLen > 1 && pathname.charCodeAt(nameLen - 1) === 47) {
    nameLen--
  }

  // 3. Early exit if the suffix cannot possibly fit
  if (nameLen < pathLen) return undefined

  // 4. Direct character comparison from the end (avoids .endsWith and .slice)
  const offset = nameLen - pathLen
  for (let i = 0; i < pathLen; i++) {
    if (pathname.charCodeAt(offset + i) !== path.charCodeAt(i)) {
      return undefined
    }
  }

  // 5. Fast segment count calculation avoiding regex, splits, and filters
  let prefixSegs = 0
  let isInsideSeg = false
  for (let i = 0; i < offset; i++) {
    if (pathname.charCodeAt(i) === 47) {
      isInsideSeg = false
    } else if (!isInsideSeg) {
      prefixSegs++
      isInsideSeg = true
    }
  }

  let suffixSegs = 0
  isInsideSeg = false
  for (let i = 0; i < pathLen; i++) {
    if (path.charCodeAt(i) === 47) {
      isInsideSeg = false
    } else if (!isInsideSeg) {
      suffixSegs++
      isInsideSeg = true
    }
  }

  // 6. Final logic shortcutting array generation
  if (prefixSegs > suffixSegs) return path

  // Compare segments sequentially from the start
  let pIdx = 0
  let sIdx = 0

  while (pIdx < offset && sIdx < pathLen) {
    // Skip leading slashes
    while (pIdx < offset && pathname.charCodeAt(pIdx) === 47) pIdx++
    while (sIdx < pathLen && path.charCodeAt(sIdx) === 47) sIdx++

    if (pIdx >= offset || sIdx >= pathLen) break

    // Compare characters of current segment
    while (pIdx < offset && sIdx < pathLen) {
      const pChar = pathname.charCodeAt(pIdx)
      const sChar = path.charCodeAt(sIdx)

      if (pChar === 47 || sChar === 47) {
        if (pChar !== sChar) return path // Segment mismatch, structure differs
        break
      }
      if (pChar !== sChar) return path
      pIdx++
      sIdx++
    }
  }

  return undefined
}
