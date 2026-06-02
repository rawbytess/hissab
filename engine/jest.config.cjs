/* eslint no-use-before-define: 0 */
/*
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/en/configuration.html
 */
process.env.TZ = "UTC";
module.exports = {
  clearMocks: true,
  coverageDirectory: "coverage",
  moduleDirectories: ["node_modules", "./src/"],
  declaration: true,
  moduleFileExtensions: ["js", "json", "jsx", "ts", "tsx", "node"],
  testEnvironment: "node",
  preset: "jest-playwright-preset",
  testMatch: ["**/?(*.)+(spec|test).+(ts|js)"],
  transform: {
    "^.+\\.(ts)$": "ts-jest",
  },
  testEnvironmentOptions: {
    "jest-playwright": {
      browsers: ["chromium", "firefox", "webkit"],
      // browsers: ["chromium"],
      launchOptions: {
        // headless: false,
        // slowMo: 600,
      },
    },
  },
};
