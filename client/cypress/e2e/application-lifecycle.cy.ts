function futureInterviewDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  date.setHours(10, 30, 0, 0);

  const pad = (value: number) => String(value).padStart(2, "0");

  return [
    date.getFullYear(),
    "-",
    pad(date.getMonth() + 1),
    "-",
    pad(date.getDate()),
    "T",
    pad(date.getHours()),
    ":",
    pad(date.getMinutes()),
  ].join("");
}

describe("application lifecycle", () => {
  beforeEach(() => {
    cy.loginDemo();
  });

  it("creates, schedules, verifies, and deletes an application", () => {
    cy.contains("a", "Applications").click();
    cy.location("pathname").should("eq", "/applications");

    cy.contains("a", "Add application").first().click();
    cy.location("pathname").should("eq", "/applications/new");

    cy.get("#company").type("Cypress Labs");
    cy.get("#position").type("E2E Frontend Engineer");
    cy.get("#location").type("Offenburg, Germany");
    cy.get("#workplaceType").select("remote");
    cy.get("#employmentType").select("full_time");
    cy.get("#technologies").type("React, TypeScript, Cypress");
    cy.get("#notes").type("Created by the RoleNaviq Cypress E2E suite.");

    cy.contains("button", "Save application").click();

    cy.location("pathname", {
      timeout: 15_000,
    }).should("eq", "/applications");

    cy.contains("article", "E2E Frontend Engineer")
      .should("contain.text", "Cypress Labs")
      .and("contain.text", "Saved");

    cy.contains("a", "E2E Frontend Engineer").click();

    cy.contains("button, a", "Edit").click();
    cy.location("pathname").should("match", /\/applications\/[^/]+\/edit$/);

    cy.get("#status").select("interview");
    cy.get("#interviewDate").type(futureInterviewDate());

    cy.contains("button", "Save changes").click();

    cy.location("pathname", {
      timeout: 15_000,
    }).should("match", /\/applications\/[^/]+$/);

    cy.contains("section", "E2E Frontend Engineer")
      .should("contain.text", "Cypress Labs")
      .and("contain.text", "Interview");

    cy.contains("a", "Calendar").click();
    cy.location("pathname").should("eq", "/calendar");

    cy.contains("article", "E2E Frontend Engineer")
      .should("contain.text", "Cypress Labs")
      .and("contain.text", "Interview")
      .within(() => {
        cy.contains("a", "View details").click();
      });

    cy.location("pathname").should("match", /\/applications\/[^/]+$/);

    cy.contains("button", "Delete").click();
    cy.contains("h2", "Delete application?").should("be.visible");
    cy.contains("button", "Delete application").click();

    cy.location("pathname", {
      timeout: 15_000,
    }).should("eq", "/applications");

    cy.contains("article", "E2E Frontend Engineer").should("not.exist");
  });
});
