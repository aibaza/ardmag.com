import { defineConfig } from "vitest/config"
import { resolve } from "path"

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/__tests__/**/*.test.ts", "src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/lib/util/adapters/**/*.ts"],
      exclude: ["src/lib/util/adapters/__tests__/**"],
    },
  },
  resolve: {
    alias: {
      "@lib": resolve(__dirname, "src/lib"),
      "@modules": resolve(__dirname, "src/modules"),
    },
  },
})
