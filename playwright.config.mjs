import { defineConfig } from "@playwright/test";

const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;
const TEST_DB = "onlineBankingDB_pw";

export default defineConfig({
  testDir: "./tests",
  timeout: 60_000,
  retries: 0,

  use: {
    baseURL: BASE_URL,
    headless: true
  },

  globalSetup: "./tests/global.setup.mjs",

 webServer: process.env.CI
  ? undefined
  : {
      command: "npm start",
      url: `${BASE_URL}/health`,
      timeout: 120_000,
      reuseExistingServer: true,
      env: {
        PORT: String(PORT),
        MONGO_URI: `mongodb://127.0.0.1:27017/${TEST_DB}`
      }
    }
});