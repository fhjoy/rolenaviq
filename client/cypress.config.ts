import { defineConfig } from "cypress";

export default defineConfig({
  viewportWidth: 1440,
  viewportHeight: 900,
  video: false,
  screenshotOnRunFailure: true,
  defaultCommandTimeout: 10_000,

  e2e: {
    baseUrl: "http://127.0.0.1:4173",
    supportFile: "cypress/support/e2e.ts",
    specPattern: "cypress/e2e/**/*.cy.ts",
  },
});
