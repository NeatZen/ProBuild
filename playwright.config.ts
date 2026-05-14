import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  timeout: 60_000,
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  expect: {
    timeout: 30_000,
  },
  use: {
    baseURL: "http://127.0.0.1:3001",
    trace: "on-first-retry",
    actionTimeout: 30_000,
  },
  webServer: {
    command: "NEXT_PUBLIC_E2E=1 npm run build && NEXT_PUBLIC_E2E=1 npm run start -- -p 3001",
    url: "http://127.0.0.1:3001",
    reuseExistingServer: false,
    timeout: 180_000,
    env: {
      NEXT_PUBLIC_E2E: "1",
    },
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
