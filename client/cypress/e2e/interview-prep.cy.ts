describe("interview preparation", () => {
  it("sends visitors to sign-in and returns them to Angular", () => {
    cy.visit("/prep/");
    cy.location("pathname").should("eq", "/login");
    cy.location("search").should("contain", "returnTo=%2Fprep%2F");

    cy.get("#email").type("demo@rolenaviq.app");
    cy.get("#password").type("RoleNaviqDemo2026!");
    cy.contains("button", "Sign in").click();

    cy.location("pathname").should("eq", "/prep/");
    cy.contains("h1", "Walk into your next interview ready.").should("be.visible");
  });

  it("opens Angular from React and saves preparation for an interview", () => {
    cy.loginDemo();

    cy.request("POST", "/api/applications", {
      company: "Angular Prep Test",
      position: "Frontend Developer",
      status: "interview",
      interviewDate: "2026-11-02T09:00:00.000Z",
      technologies: ["Angular"],
    }).then(({ body }) => {
      const id = body.application._id as string;

      cy.contains("a", "Interview prep").click();
      cy.location("pathname").should("eq", "/prep/");
      cy.contains("Angular Prep Test").should("be.visible");
      cy.visit(`/prep/interviews/${id}`);
      cy.contains("h1", "Frontend Developer").should("be.visible");
      cy.contains("label", "Research the company and its product").click();
      cy.get("#prep-notes").type("Review the team's product.");
      cy.contains("button", "Save preparation").click();
      cy.contains("span", "Saved").should("be.visible");

      cy.reload();
      cy.get("#prep-notes").should("have.value", "Review the team's product.");
      cy.contains("label", "Research the company and its product")
        .find("input")
        .should("be.checked");
    });
  });
});
