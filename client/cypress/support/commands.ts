Cypress.Commands.add("loginDemo", () => {
  cy.visit("/login?demo=1");

  cy.get("#email").should("have.value", "demo@rolenaviq.app");
  cy.get("#password").should("have.value", "RoleNaviqDemo2026!");

  cy.contains("button", "Enter demo").click();

  cy.location("pathname", {
    timeout: 15_000,
  }).should("eq", "/dashboard");
});

declare global {
  namespace Cypress {
    interface Chainable {
      loginDemo(): Chainable<void>;
    }
  }
}

export {};
