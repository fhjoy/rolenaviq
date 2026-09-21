describe("board and calendar workflows", () => {
  beforeEach(() => {
    cy.loginDemo();
  });

  it("reopens a rejected application from the board", () => {
    cy.contains("a", "Board").click();
    cy.location("pathname").should("eq", "/board");

    cy.contains("article", "React Developer")
      .should("contain.text", "PixelRoute")
      .within(() => {
        cy.contains("button", "Reopen application").click();
      });

    cy.contains("Application reopened and moved to Applied", {
      timeout: 15_000,
    }).should("be.visible");

    cy.contains("h2", "Applied")
      .closest("section")
      .should("contain.text", "React Developer")
      .and("contain.text", "PixelRoute");

    cy.contains("h2", "Rejected")
      .closest("section")
      .should("not.contain.text", "PixelRoute");
  });

  it("shows the demo interviews in the calendar", () => {
    cy.contains("a", "Calendar").click();
    cy.location("pathname").should("eq", "/calendar");

    cy.contains("h1", "Calendar").should("be.visible");
    cy.contains("Upcoming interviews")
      .parent()
      .parent()
      .should("contain.text", "2 scheduled");

    cy.contains("article", "Frontend Engineer")
      .should("contain.text", "Northstar Labs");

    cy.contains("article", "Full Stack Developer")
      .should("contain.text", "Cloudforge");
  });
});
