describe("demo application loading", () => {
  beforeEach(() => {
    cy.loginDemo();
  });

  it("loads the next ten applications as the list is scrolled", () => {
    cy.contains("a", "Applications").click();
    cy.location("pathname").should("eq", "/applications");
    cy.contains("Showing 10 of 30 applications").should("exist");

    cy.scrollTo("bottom");
    cy.contains("Showing 20 of 30 applications").should("exist");

    cy.scrollTo("bottom");
    cy.contains("Showing 30 of 30 applications").should("exist");
  });

  it("loads another page in the dashboard's recent list", () => {
    cy.location("pathname").should("eq", "/dashboard");
    cy.contains("Showing 10 of 30 applications").should("exist");

    cy.scrollTo("bottom");
    cy.contains("Showing 20 of 30 applications").should("exist");
  });
});
