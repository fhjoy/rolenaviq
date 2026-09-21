describe("authentication", () => {
  it("redirects unauthenticated users away from protected routes", () => {
    cy.visit("/dashboard");

    cy.location("pathname").should("eq", "/login");
    cy.location("search").should("contain", "expired=1");
    cy.contains("h1, h2", "Welcome back").should("be.visible");
  });

  it("registers a real user and signs in through the browser", () => {
    cy.visit("/register");

    cy.get("#firstName").type("Cypress");
    cy.get("#lastName").type("Tester");
    cy.get("#email").type("cypress.tester@example.com");
    cy.get("#password").type("StrongPass123!");
    cy.get("#confirmPassword").type("StrongPass123!");

    cy.contains("button", "Create account").click();

    cy.location("pathname").should("eq", "/login");
    cy.location("search").should("contain", "registered=1");
    cy.contains("Account created").should("be.visible");

    cy.get("#email").type("cypress.tester@example.com");
    cy.get("#password").type("StrongPass123!");
    cy.contains("button", "Sign in").click();

    cy.location("pathname", {
      timeout: 15_000,
    }).should("eq", "/dashboard");
    cy.contains("h1", "Dashboard").should("be.visible");
  });

  it("logs into the demo account and signs out cleanly", () => {
    cy.loginDemo();

    cy.contains("h1", "Dashboard").should("be.visible");

    cy.contains("button", "Logout").click();
    cy.contains("h2", "Sign out?").should("be.visible");
    cy.contains("button", "Sign out").click();

    cy.location("pathname").should("eq", "/login");
    cy.contains("h1, h2", "Welcome back").should("be.visible");
  });
});
