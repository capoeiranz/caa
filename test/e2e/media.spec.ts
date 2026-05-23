import { expect, test } from "@playwright/test"
import type { Page } from "@playwright/test"

function getSourcePath(mediaUrl: string) {
  const url = new URL(mediaUrl, "http://localhost")
  const mediaPrefix = "/media"

  if (!url.pathname.startsWith(mediaPrefix)) {
    throw new Error(`expected media url, received ${mediaUrl}`)
  }

  return url.pathname.slice(mediaPrefix.length)
}

async function readPixelAlpha(page: Page, url: string) {
  return page.evaluate(async (imageUrl) => {
    const absoluteUrl = new URL(imageUrl, window.location.origin).toString()
    const response = await fetch(absoluteUrl)
    const blob = await response.blob()
    const bitmap = await createImageBitmap(blob)
    const canvas = document.createElement("canvas")
    canvas.width = bitmap.width
    canvas.height = bitmap.height

    const context = canvas.getContext("2d")
    if (!context) {
      throw new Error("2d context unavailable")
    }

    context.drawImage(bitmap, 0, 0)

    return {
      width: bitmap.width,
      leftAlpha: context.getImageData(1, Math.floor(bitmap.height / 2), 1, 1).data[3],
      rightAlpha: context.getImageData(bitmap.width - 2, Math.floor(bitmap.height / 2), 1, 1)
        .data[3],
    }
  }, url)
}

test.describe("Media route", { tag: "@tdd" }, async () => {
  test("rejects legacy height transforms", async ({ page, request }) => {
    await page.goto("/")

    const image = page.getByRole("img", { name: "Capoeira Angola Aotearoa logo" })
    const imageSrc = await image.getAttribute("src")

    expect(imageSrc).toBeTruthy()

    const sourcePath = getSourcePath(imageSrc!)
    const response = await request.get(`/media${sourcePath}?w=40&h=20`)

    expect(response.status()).toBe(400)
  })

  test("homepage image markup uses width-only media urls", async ({ page }) => {
    await page.goto("/")

    const image = page.getByRole("img", { name: "Capoeira Angola Aotearoa logo" })
    const imageSrc = await image.getAttribute("src")
    const imageSrcSet = await image.getAttribute("srcset")
    const webpSource = page.locator('picture source[type="image/webp"]')
    const webpSrcSet = await webpSource.getAttribute("srcset")

    expect(imageSrc).toBeTruthy()
    expect(imageSrc).not.toContain("h=")
    expect(imageSrc).not.toContain("fit=")

    expect(imageSrcSet).toBeTruthy()
    expect(imageSrcSet).not.toContain("h=")
    expect(imageSrcSet).not.toContain("fit=")

    expect(webpSrcSet).toBeTruthy()
    expect(webpSrcSet).toContain("fmt=webp")
    expect(webpSrcSet).not.toContain("h=")
    expect(webpSrcSet).not.toContain("fit=")
  })

  test("rejects fmt without width", async ({ page, request }) => {
    await page.goto("/")

    const image = page.getByRole("img", { name: "Capoeira Angola Aotearoa logo" })
    const imageSrc = await image.getAttribute("src")

    expect(imageSrc).toBeTruthy()

    const sourcePath = getSourcePath(imageSrc!)
    const response = await request.get(`/media${sourcePath}?fmt=webp`)

    expect(response.status()).toBe(400)
  })

  test("rejects non-webp explicit formats", async ({ page, request }) => {
    await page.goto("/")

    const image = page.getByRole("img", { name: "Capoeira Angola Aotearoa logo" })
    const imageSrc = await image.getAttribute("src")

    expect(imageSrc).toBeTruthy()

    const sourcePath = getSourcePath(imageSrc!)
    const response = await request.get(`/media${sourcePath}?w=40&fmt=png`)

    expect(response.status()).toBe(400)
  })

  test("rejects query shapes outside the public media contract", async ({ page, request }) => {
    await page.goto("/")

    const image = page.getByRole("img", { name: "Capoeira Angola Aotearoa logo" })
    const imageSrc = await image.getAttribute("src")

    expect(imageSrc).toBeTruthy()

    const sourcePath = getSourcePath(imageSrc!)
    const invalidUrls = [
      `/media${sourcePath}?fmt=webp&w=40`,
      `/media${sourcePath}?w=40&foo=bar`,
      `/media${sourcePath}?w=40&w=80`,
      `/media${sourcePath}?w=`,
    ]

    for (const url of invalidUrls) {
      const response = await request.get(url)

      expect(response.status(), url).toBe(400)
    }
  })

  test("propagates source 404 responses", async ({ request }) => {
    const response = await request.get("/media/this-file-does-not-exist.png?w=40")

    expect(response.status()).toBe(404)
  })

  test("serves direct media png requests as image passthrough responses", async ({
    page,
    request,
  }) => {
    const response = await request.get("/media/media-fixtures/alpha-split.png")

    expect(response.status()).toBe(200)
    expect(response.headers()["content-type"]).toContain("image/png")
    expect(response.headers()["x-media-mode"]).toBe("passthrough")

    const body = await response.body()
    expect(body.subarray(0, 8)).toEqual(
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    )

    const browserResponse = await page.goto("/media/media-fixtures/alpha-split.png")

    expect(browserResponse?.status()).toBe(200)
    expect(browserResponse?.headers()["content-type"]).toContain("image/png")
    await expect(page.locator("body > img")).toHaveCount(1)
  })

  test("rejects recursive and empty-segment media source paths", async ({ request }) => {
    const invalidPaths = [
      "/media/media/media-fixtures/alpha-split.png",
      "/media//media-fixtures/alpha-split.png",
    ]

    for (const path of invalidPaths) {
      const response = await request.get(path)

      expect(response.status(), path).toBe(400)
    }
  })

  test("uses x-media diagnostics on transformed responses", async ({ page, request }) => {
    await page.goto("/")

    const image = page.getByRole("img", { name: "Capoeira Angola Aotearoa logo" })
    const imageSrc = await image.getAttribute("src")

    expect(imageSrc).toBeTruthy()

    const sourcePath = getSourcePath(imageSrc!)
    const response = await request.get(`/media${sourcePath}?w=40&fmt=webp`)

    expect(response.status()).toBe(200)
    expect(response.headers()["x-media-mode"]).toBe("transform")
    expect(response.headers()["x-media-format"]).toBe("webp")
    expect(response.headers()["x-media-width"]).toBe("40")
    expect(response.headers()["x-image-worker-mode"]).toBeUndefined()
  })

  test("returns no body for successful head requests", async ({ page, request }) => {
    await page.goto("/")

    const image = page.getByRole("img", { name: "Capoeira Angola Aotearoa logo" })
    const imageSrc = await image.getAttribute("src")

    expect(imageSrc).toBeTruthy()

    const sourcePath = getSourcePath(imageSrc!)
    const response = await request.fetch(`/media${sourcePath}?w=40`, { method: "HEAD" })

    expect(response.status()).toBe(200)
    expect(await response.text()).toBe("")
  })

  test("returns no body for failed head requests", async ({ request }) => {
    const response = await request.fetch("/media/this-file-does-not-exist.png?w=40", {
      method: "HEAD",
    })

    expect(response.status()).toBe(404)
    expect(await response.text()).toBe("")
  })

  test("does not upscale and reports the actual delivered width", async ({ page, request }) => {
    await page.goto("/")

    const image = page.getByRole("img", { name: "Capoeira Angola Aotearoa logo" })
    const imageSrc = await image.getAttribute("src")

    expect(imageSrc).toBeTruthy()

    const sourcePath = getSourcePath(imageSrc!)
    const sourceSize = await page.evaluate(async (path) => {
      const loadedImage = new Image()
      loadedImage.src = path

      await loadedImage.decode()

      return {
        width: loadedImage.naturalWidth,
        height: loadedImage.naturalHeight,
      }
    }, sourcePath)

    const requestedWidth = sourceSize.width + 100
    const response = await request.get(`/media${sourcePath}?w=${requestedWidth}&fmt=webp`)

    expect(response.status()).toBe(200)
    expect(response.headers()["x-media-mode"]).toBe("transform")
    expect(response.headers()["x-media-format"]).toBe("webp")
    expect(response.headers()["x-media-width"]).toBe(String(sourceSize.width))
    expect(response.headers()["content-type"]).toContain("image/webp")
  })

  test("preserves alpha for same-size and downscaled webp transforms", async ({
    page,
    request,
  }) => {
    await page.goto("/")

    const fixturePath = "/media-fixtures/alpha-split.png"

    const sameSizeResponse = await request.get(`/media${fixturePath}?w=16&fmt=webp`)
    expect(sameSizeResponse.status()).toBe(200)
    expect(sameSizeResponse.headers()["content-type"]).toContain("image/webp")

    const sameSizePixels = await readPixelAlpha(page, `/media${fixturePath}?w=16&fmt=webp`)
    expect(sameSizePixels.width).toBe(16)
    expect(sameSizePixels.leftAlpha).toBeLessThan(10)
    expect(sameSizePixels.rightAlpha).toBeGreaterThan(245)

    const downscaledResponse = await request.get(`/media${fixturePath}?w=8&fmt=webp`)
    expect(downscaledResponse.status()).toBe(200)
    expect(downscaledResponse.headers()["content-type"]).toContain("image/webp")

    const downscaledPixels = await readPixelAlpha(page, `/media${fixturePath}?w=8&fmt=webp`)
    expect(downscaledPixels.width).toBe(8)
    expect(downscaledPixels.leftAlpha).toBeLessThan(10)
    expect(downscaledPixels.rightAlpha).toBeGreaterThan(245)
  })
})
