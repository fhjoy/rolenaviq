describe("guided demo route", () => {
  it("moves from React through Angular and returns after saving a plan", () => {
    cy.visit("/");
    cy.get("main > section").first().contains("a", "Take guided tour").should("have.attr", "href", "/login?demo=1&returnTo=%2Fdashboard%3Ftour%3D1");
    cy.get("#guided-tour").contains("a", "Start guided tour").click();
    cy.location("pathname").should("eq", "/login");
    cy.contains("button", "Enter demo").click();

    cy.location("pathname").should("eq", "/dashboard");
    cy.contains("Guided tour · Step 1 of 3").should("be.visible");
    cy.contains("a", "View example application").click();
    cy.location("pathname").should("match", /^\/applications\/[^/]+$/);
    cy.contains("Northstar Labs").should("be.visible");
    cy.contains("Guided tour · Step 2 of 3").should("be.visible");
    cy.contains("a", "Open interview plan").click();

    cy.location("pathname").should("match", /^\/prep\/interviews\/[^/]+$/);
    cy.location("search").should("eq", "?tour=1");
    cy.contains("Guided tour · Step 3 of 3").should("be.visible");
    cy.contains("label", "Research the company and its product").click();
    cy.contains("button", "Save preparation").click();
    cy.contains("a", "Finish tour").should("be.visible").click();

    cy.location("pathname").should("eq", "/dashboard");
    cy.contains("Guided tour · Step 1 of 3").should("not.exist");
  });

  it("lets a demo visitor start the tour after signing in normally", () => {
    cy.loginDemo();
    cy.contains("a", "Take guided tour").click();
    cy.location("search").should("eq", "?tour=1");
    cy.contains("Guided tour · Step 1 of 3").should("be.visible");
  });
});
