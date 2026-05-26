import { configDefaults, defineConfig } from "vitest/config"

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    exclude: [...configDefaults.exclude, "**/*spec*"],
  },
})

export default config
