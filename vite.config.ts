import { cloudflare } from "@cloudflare/vite-plugin"
import tailwindcss from "@tailwindcss/vite"
import { devtools } from "@tanstack/devtools-vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import { defineConfig } from "vite"

const SST_WRANGLER_PATH = process.env.SST_WRANGLER_PATH

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: "ui",
              test: /@base-ui/,
            },
          ],
        },
      },
    },
  },
  plugins: [
    devtools(),
    SST_WRANGLER_PATH
      ? cloudflare({
          viteEnvironment: { name: "ssr" },
          configPath: process.env.SST_WRANGLER_PATH,
        })
      : undefined,
    tailwindcss(),
    tanstackStart({
      prerender: {
        enabled: true,
      },
    }),
    viteReact(),
  ],
})

export default config
