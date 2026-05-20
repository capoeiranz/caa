import { expect, test } from "../../playwright.image.config"

test.describe("Image worker", { tag: "@tdd" }, async () => {
  test("GET /i returns 400 when src is missing", async ({ request, sst: { imageUrl } }) => {
    const workerUrl = new URL("/i", imageUrl)
    const response = await request.get(workerUrl.toString())

    expect(response.status()).toBe(400)
    await expect(response.text()).resolves.toBe("missing src")
  })

  test("GET /i returns 400 when src is malformed", async ({ request, sst: { imageUrl } }) => {
    const workerUrl = new URL("/i", imageUrl)
    workerUrl.searchParams.set("src", "not-a-url")
    const response = await request.get(workerUrl.toString())

    expect(response.status()).toBe(400)
    await expect(response.text()).resolves.toBe("invalid src")
  })

  test("GET /i returns 400 when src origin is disallowed", async ({
    request,
    sst: { imageUrl },
  }) => {
    const workerUrl = new URL("/i", imageUrl)
    workerUrl.searchParams.set("src", "https://example.com/logo.png")
    const response = await request.get(workerUrl.toString())

    expect(response.status()).toBe(400)
    await expect(response.text()).resolves.toBe("src origin not allowed")
  })

  test("GET /i returns same-origin image bytes", async ({
    request,
    sst: { imageSourceBaseUrl, imageUrl },
  }) => {
    const sourceUrl = new URL("/favicon.ico", imageSourceBaseUrl).toString()
    const workerUrl = new URL("/i", imageUrl)
    workerUrl.searchParams.set("src", sourceUrl)
    const workerResponse = await request.get(workerUrl.toString())
    const sourceResponse = await request.get(sourceUrl)

    expect(workerResponse.status()).toBe(200)
    expect(workerResponse.headers()["content-type"]).toBe(sourceResponse.headers()["content-type"])

    const [workerBuffer, sourceBuffer] = await Promise.all([
      workerResponse.body(),
      sourceResponse.body(),
    ])

    expect(workerBuffer).toEqual(sourceBuffer)
  })
})
