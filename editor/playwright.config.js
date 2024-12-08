import { devices } from "@playwright/test";

const config = {
  use: {
    baseURL: "http://localhost:7593",
    headless: true,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    video: "on-first-retry",
  },
  testDir: "test",
  webServer: {
    command: "npm run dev",
    url: "http://localhost:7593",
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    /* {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    }, */
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],
};
export default config;
