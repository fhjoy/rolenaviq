describe("follow-up workflow on a small screen", () => {
  it("keeps action controls usable with focus and updates the dashboard and calendar", () => {
    cy.viewport(390, 844);
    cy.loginDemo();
    cy.request("/api/applications?search=Northstar%20Labs&limit=10").then(response => {
      const application = response.body.applications[0];
      cy.visit(`/applications/${application._id}`);
    });

    const due = new Date(Date.now() + 3 * 86_400_000).toISOString().slice(0, 10);
    cy.get("#new-action").focus().should("have.focus").type("Send portfolio link");
    cy.press(Cypress.Keyboard.Keys.TAB);
    cy.get("#new-action-date").should("have.focus").type(due);
    cy.get("#new-action-date").should("have.value", due);
    cy.intercept("POST", "/api/actions").as("createAction");
    cy.contains("button", "Add action").focus().should("have.focus").click();
    cy.wait("@createAction").its("response.statusCode").should("eq", 201);
    cy.contains("li", "Send portfolio link").should("be.visible");
    cy.document().then(document => expect(document.documentElement.scrollWidth).to.be.at.most(390));

    cy.visit("/dashboard");
    cy.contains("a", "Send portfolio link").should("be.visible");
    cy.contains("h2", "Interview Prep at a glance").should("be.visible");
    cy.visit("/calendar");
    cy.contains("#follow-ups-heading", "Follow-ups").should("exist");
    cy.contains("a", "Send portfolio link").should("be.visible");
    cy.contains("a", "Send portfolio link").click();
    cy.contains("li", "Send portfolio link").contains("button", "Mark complete").click();
    cy.contains("li", "Send portfolio link").contains("button", "Reopen").should("be.visible");
    cy.visit("/dashboard");
    cy.contains("a", "Send portfolio link").should("not.exist");
  });
});
