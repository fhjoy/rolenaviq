describe("authentication", () => {
  it("redirects unauthenticated users away from protected routes", () => {
    cy.visit("/dashboard");

    cy.location("pathname").should("eq", "/login");
    cy.location("search").should("contain", "expired=1");
    cy.contains('[data-slot="card-title"]', "Welcome back").should("be.visible");
  });

  it("registers a real user and signs in through the browser", () => {
    const email = `cypress.tester.${crypto.randomUUID()}@example.com`;

    cy.visit("/register");

    cy.get("#firstName").type("Cypress");
    cy.get("#lastName").type("Tester");
    cy.get("#email").type(email);
    cy.get("#password").type("StrongPass123!");
    cy.get("#confirmPassword").type("StrongPass123!");

    cy.contains("button", "Create account").click();

    cy.location("pathname").should("eq", "/login");
    cy.location("search").should("contain", "registered=1");
    cy.contains("Account created").should("be.visible");

    cy.get("#email").type(email);
    cy.get("#password").type("StrongPass123!");
    cy.contains("button", "Sign in").click();

    cy.location("pathname", {
      timeout: 15_000,
    }).should("eq", "/dashboard");
    cy.get("main").contains("Welcome back").should("be.visible");
  });

  it("logs into the demo account and signs out cleanly", () => {
    cy.loginDemo();

    cy.get("main").contains("Welcome back").should("be.visible");

    cy.contains("button", "Logout").click();
    cy.contains("h2", "Sign out?").should("be.visible");
    cy.contains("button", "Sign out").click();

    cy.location("pathname").should("eq", "/login");
    cy.contains('[data-slot="card-title"]', "Welcome back").should("be.visible");
  });
});
