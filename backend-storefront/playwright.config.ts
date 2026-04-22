import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
  testDir: "./tests",
  timeout: 30_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: [["list"], ["html", { outputFolder: "test-results/report", open: "never" }]],
  use: {
    baseURL: process.env.BASE_URL ?? "http://localhost:8000",
    trace: "on-first-retry",
    screenshot: "on",
    video: "off",
  },
  projects: [
    {
      name: "chromium-mobile",
      use: {
        ...devices["Pixel 5"],
        channel: "chromium",
        viewport: { width: 375, height: 812 },
        deviceScaleFactor: 2,
      },
    },
    {
      name: "chromium-tablet",
      use: {
        ...devices["Desktop Chrome"],
        channel: "chromium",
        viewport: { width: 768, height: 1024 },
        deviceScaleFactor: 2,
        userAgent: "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
      },
    },
    {
      name: "chromium-desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
        deviceScaleFactor: 1,
      },
    },
  ],
})
