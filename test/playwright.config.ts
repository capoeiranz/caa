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

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./e2e",
  outputDir: "./results",
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [["list"], ["html", { open: "never", outputFolder: "./playwright-report" }]],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL,
    extraHTTPHeaders,
    screenshot: "only-on-failure",
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "smoke",
      grep: /@smoke/,
    },
    {
      name: "tdd",
      grep: /@tdd/,
    },
  ],
  webServer: remoteBaseUrl
    ? undefined
    : {
        command: "pnpm dev",
        reuseExistingServer: true,
        url: "http://localhost:3000",
        stderr: "pipe",
      },
})
