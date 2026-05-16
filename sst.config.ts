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

    const app = new sst.cloudflare.TanStackStart("Web", {
      path: ".",
      buildCommand: "pnpm build",
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

    return {
      url: app.url,
    }
  },
})
