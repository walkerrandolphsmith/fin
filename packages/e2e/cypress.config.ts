import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    downloadsFolder: "src/downloads",
    fixturesFolder: "src/fixtures",
    screenshotsFolder: "src/screenshots",
    specPattern: "src/tests/**/*.cy.ts",
    supportFile: "src/support/e2e.ts",
    videosFolder: "src/videos",
    setupNodeEvents(on, config) {
      return config;
    },
  },
});
