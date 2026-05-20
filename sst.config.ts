// oxlint-disable-next-line typescript/triple-slash-reference
/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "caa",
      home: "cloudflare",
      removal: input.stage === "production" ? "retain" : "remove",
      protect: input.stage === "production",
    }
  },
  async run() {
    const isProduction = $app.stage === "production"
    const clientSiteBaseUrl = isProduction ? "https://capoeira.org.nz" : "http://localhost:3000"
    const workerSourceBaseUrl = "https://capoeira.org.nz"

    const imageWorker = new sst.cloudflare.Worker("ImageWorker", {
      handler: "workers/image/index.ts",
      url: true,
      environment: {
        SITE_BASE_URL: workerSourceBaseUrl,
      },
      ...(isProduction && {
        domain: "img.capoeira.org.nz",
      }),
    })

    const app = new sst.cloudflare.TanStackStart("Web", {
      path: ".",
      buildCommand: "pnpm build",
      environment: {
        VITE_SITE_BASE_URL: clientSiteBaseUrl,
        VITE_IMAGE_BASE_URL: imageWorker.url.apply((url) => url ?? "http://localhost:3000"),
      },
      transform: {
        server: {
          compatibility: {
            date: "2025-09-02",
            flags: ["nodejs_compat"],
          },
        },
      },
      ...(isProduction && {
        domain: {
          name: "capoeira.org.nz",
          redirects: ["www.capoeira.net.nz", "capoeira.net.nz", "www.capoeira.org.nz"],
        },
      }),
    })

    $resolve([]).apply(async () => {
      if (!isProduction) {
        return
      }

      console.log("🚀 Worker deployed successfully. Triggering Cloudflare cache purge...")

      if (!process.env.CLOUDFLARE_ZONE_ID) {
        throw new Error("No Zone ID set")
      }

      const response = await fetch(
        `https://api.cloudflare.com/client/v4/zones/${process.env.CLOUDFLARE_ZONE_ID}/purge_cache`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ purge_everything: true }),
        },
      )

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`❌ Cloudflare CDN Purge Rejected (HTTP ${response.status}): ${errorText}`)
      }

      console.log("✅ Cloudflare CDN cache purged successfully. Deployment fully complete.")
    })

    return {
      url: app.url,
      imageUrl: imageWorker.url,
      imageSourceBaseUrl: workerSourceBaseUrl,
    }
  },
})
