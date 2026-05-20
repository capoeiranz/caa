import { defineConfig } from "@playwright/test"

const remoteBaseUrl = process.env.PLAYWRIGHT_BASE_URL
const baseURL = remoteBaseUrl ?? "http://localhost:3000"
const accessClientId = process.env.CLOUDFLARE_ACCESS_CLIENT_ID
const accessClientSecret = process.env.CLOUDFLARE_ACCESS_CLIENT_SECRET
const extraHTTPHeaders =
  accessClientId && accessClientSecret
    ? {
        "CF-Access-Client-Id": accessClientId,
        "CF-Access-Client-Secret": accessClientSecret,
      }
    : undefined

import { expect, test as base } from "@playwright/test"

export { expect }

type ImageWorkerOptions = { sst: { imageSourceBaseUrl: string; imageUrl: string } }

export const test = base.extend<{}, ImageWorkerOptions>({
  sst: [
    // Empty destructure required for playwright runtime validation
    // eslint-disable-next-line no-empty-pattern
    async ({}, use) => {
      const { default: sst } = await import("./.sst/outputs.json", { with: { type: "json" } })
      use(sst)
    },
    { scope: "worker" },
  ],
})

export default defineConfig<ImageWorkerOptions>({
  testDir: "./test/e2e",
  outputDir: "./test/results/image-worker",
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: "test/playwright-report/image-worker" }],
  ],
  use: {
    baseURL,
    extraHTTPHeaders,
    screenshot: "only-on-failure",
    trace: "on-first-retry",
  },
  grep: /@tdd/,
  webServer: remoteBaseUrl
    ? undefined
    : {
        command: "pnpm sst:ci",
        reuseExistingServer: true,
        url: "http://localhost:3000",
        stderr: "pipe",
      },
})
